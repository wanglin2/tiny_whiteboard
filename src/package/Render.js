import Rectangle from "./elements/Rectangle";
import Circle from "./elements/Circle";
import Diamond from "./elements/Diamond";
import Triangle from "./elements/Triangle";
import Freedraw from "./elements/Freedraw";
import { getTowPointDistance } from "./utils";
import { computedLineWidthBySpeed } from "./utils";

// 渲染类
export default class Render {
  constructor(app) {
    this.app = app;
    this.ctx = app.ctx;
    // 所有元素
    this.elementList = [];
    // 当前激活元素
    this.activeElements = [];
    // 当前正在创建新元素
    this.isCreatingElement = false;
    // 当前正在调整元素
    this.isResizing = false;
    // 当前正在调整的元素
    this.resizingElement = null;
  }

  // 添加元素
  addElement(element) {
    this.elementList.push(element);
    return this;
  }

  // 删除元素
  deleteElement(element) {
    let index = this.elementList.findIndex((item) => {
      return item === element;
    });
    if (index !== -1) {
      this.elementList.splice(index, 1);
    }
    return this;
  }

  // 是否存在激活元素
  hasActiveElements() {
    return this.activeElements.length > 0;
  }

  // 添加激活元素
  addActiveElement(element) {
    element.isActive = true;
    if (!this.activeElements.includes(element)) {
      this.activeElements.push(element);
    }
    this.app.emit("activeElementChange", this.activeElements);
    return this;
  }

  // 设置激活元素
  setActiveElements(elements) {
    if (!elements) {
      elements = [];
    }
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    this.clearActiveElements();
    elements.forEach((element) => {
      element.isActive = true;
    });
    this.activeElements = elements;
    this.app.emit("activeElementChange", this.activeElements);
    return this;
  }

  // 清除当前激活元素
  clearActiveElements() {
    this.activeElements.forEach((element) => {
      element.isActive = false;
    });
    this.activeElements = [];
    this.app.emit("activeElementChange", this.activeElements);
    return this;
  }

  // 检测是否点击选中元素
  checkIsHitElement(e) {
    // 判断是否选中元素
    let x = e.clientX;
    let y = this.app.coordinate.addScrollY(e.clientY);
    for (let i = 0; i < this.elementList.length; i++) {
      let element = this.elementList[i];
      if (element.isHit(x, y)) {
        return element;
      }
    }
    return null;
  }

  // 创建元素
  createElement(opts = {}, callback = () => {}, ctx = null) {
    if (this.hasActiveElements() || this.isCreatingElement) {
      return this;
    }
    let element = null;
    switch (opts.type) {
      case "rectangle":
        element = new Rectangle(opts, this.app);
        break;
      case "diamond":
        element = new Diamond(opts, this.app);
        break;
      case "triangle":
        element = new Triangle(opts, this.app);
        break;
      case "circle":
        element = new Circle(opts, this.app);
        break;
      case "freedraw":
        element = new Freedraw(opts, this.app);
        break;
      default:
        break;
    }
    this.addElement(element);
    this.addActiveElement(element);
    this.isCreatingElement = true;
    callback.call(ctx, element);
    return this;
  }

  // 创建类矩形元素
  creatingRectangleLikeElement(type, x, y, offsetX, offsetY) {
    this.createElement({
      type,
      x: x,
      y: y,
      width: offsetX,
      height: offsetY,
    })
      .updateActiveElementSize(offsetX, offsetY)
      .render();
  }

  // 正在创建圆形元素
  creatingCircle(x, y, e) {
    this.createElement({
      type: "circle",
      x: x,
      y: y,
    });
    let radius = getTowPointDistance(
      e.clientX,
      this.app.coordinate.addScrollY(e.clientY),
      x,
      y
    );
    this.updateActiveElementSize(radius, radius).render();
  }

  // 正在创建自由画笔元素
  creatingFreedraw(x, y, e, event) {
    this.createElement({
      type: "freedraw",
    });
    let element = this.activeElements[0];
    // 计算画笔粗细
    let lineWidth = computedLineWidthBySpeed(
      event.mouseSpeed,
      element.lastLineWidth
    );
    element.lastLineWidth = lineWidth;
    element.addPoint(
      e.clientX,
      this.app.coordinate.addScrollY(e.clientY),
      lineWidth
    );
    // 绘制自由线不重绘，采用增量绘制，否则会卡顿
    let tfp = this.app.coordinate.transformToCanvasCoordinate(
      event.lastMousePos.x,
      event.lastMousePos.y
    );
    let ttp = this.app.coordinate.transformToCanvasCoordinate(
      e.clientX,
      e.clientY
    );
    element.singleRender(tfp.x, tfp.y, ttp.x, ttp.y, lineWidth);
  }

  // 创建元素完成
  completeCreateElement() {
    this.isCreatingElement = false;
    this.activeElements.forEach((element) => {
      if (["freedraw"].includes(element.type)) {
        element.updateMultiPointBoundingRect();
      }
      element.isCreating = false;
    });
    return this;
  }

  // 更新激活元素尺寸
  updateActiveElementSize(width, height) {
    this.activeElements.forEach((element) => {
      element.width = width;
      element.height = height;
    });
    return this;
  }

  // 为元素设置样式
  setElementStyle(style = {}) {
    if (!this.hasActiveElements()) {
      return this;
    }
    Object.keys(style).forEach((key) => {
      this.activeElements.forEach((element) => {
        element.style[key] = style[key];
      });
    });
    this.render();
    return this;
  }

  // 清除画布
  clearCanvas() {
    let { width, height } = this.app;
    this.ctx.clearRect(-width / 2, -height / 2, width, height);
    return this;
  }

  // 绘制所有元素
  render() {
    let { state } = this.app;
    this.clearCanvas();
    this.ctx.save();
    // 整体缩放
    this.ctx.scale(state.scale, state.scale);
    this.elementList.forEach((element) => {
      // 不需要渲染
      if (element.noRender) {
        return;
      }
      element.render();
    });
    this.ctx.restore();
    return this;
  }

  // 检查是否需要进行元素调整操作
  checkIsResize(x, y, e) {
    if (!this.hasActiveElements()) {
      return false;
    }
    let element = null;
    let isInDragElement = "";
    for (let i = 0; i < this.activeElements.length; i++) {
      // 按住了拖拽元素的某个部分
      element = this.activeElements[i];
      isInDragElement = element.dragElement.checkPointInDragElementWhere(x, y);
      if (isInDragElement) {
        break;
      }
    }
    if (isInDragElement) {
      this.isResizing = true;
      this.resizingElement = element;
      element.startResize(isInDragElement, e);
      return true;
    }
    return false;
  }

  // 进行元素调整操作
  handleResize(...args) {
    if (!this.isResizing) {
      return;
    }
    this.resizingElement.resize(...args);
    this.render();
  }

  // 结束元素调整操作
  endResize() {
    this.isResizing = false;
    this.resizingElement.endResize();
    this.resizingElement = null;
  }

  // 设置鼠标指针样式
  setCursor(type = "default") {
    this.app.canvas.style.cursor = type;
  }

  // 隐藏鼠标指针
  hideCursor() {
    this.app.canvas.style.cursor = "none";
  }

  // 复位鼠标指针
  resetCursor() {
    this.app.canvas.style.cursor = "default";
  }
}
