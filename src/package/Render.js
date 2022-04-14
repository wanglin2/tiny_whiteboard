import Rectangle from "./elements/Rectangle";
import { CORNERS, DRAG_ELEMENT_PARTS } from "./constants";
import {
  getTowPointRotate,
  getElementCenterPoint,
  transformPointReverseRotate,
  getElementRotatedCornerPoint,
  getTowPointDistance,
  deepCopy,
} from "./utils";

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
    this.resizeElements = [];
    // 当前正在进行何种调整操作
    this.resizeType = "";
    // 当前鼠标按住拖拽元素的点的对角点
    this.diagonalPoint = {
      x: 0,
      y: 0,
    };
    // 当前鼠标按下时的坐标和拖拽元素的点的坐标差值
    this.mousedownPosAndElementPosOffset = {
      x: 0,
      y: 0,
    };
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
    if (this.hasActiveElements()) {
      return this;
    }
    let element = null;
    switch (opts.type) {
      case "rectangle":
        element = new Rectangle(opts, this.app);
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

  // 创建元素完成
  completeCreateElement() {
    this.isCreatingElement = false;
    this.activeElements.forEach((element) => {
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

  // 检查是否需要进行缩放移动操作
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
      this.resizeElements = [element];
      this.resizeType = isInDragElement;
      if (isInDragElement === DRAG_ELEMENT_PARTS.BODY) {
        // 按住了拖拽元素内部
        element.saveState();
      } else if (isInDragElement === DRAG_ELEMENT_PARTS.ROTATE) {
        // 按住了拖拽元素的旋转按钮
        element.saveState();
      } else if (isInDragElement === DRAG_ELEMENT_PARTS.TOP_LEFT_BTN) {
        // 按住了拖拽元素左上角拖拽手柄
        this.handleElementDragMousedown(e, CORNERS.TOP_LEFT);
      } else if (isInDragElement === DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN) {
        // 按住了拖拽元素右上角拖拽手柄
        this.handleElementDragMousedown(e, CORNERS.TOP_RIGHT);
      } else if (isInDragElement === DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN) {
        // 按住了拖拽元素右下角拖拽手柄
        this.handleElementDragMousedown(e, CORNERS.BOTTOM_RIGHT);
      } else if (isInDragElement === DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN) {
        // 按住了拖拽元素左下角拖拽手柄
        this.handleElementDragMousedown(e, CORNERS.BOTTOM_LEFT);
      }
      return true;
    }
    return false;
  }

  // 结束调整元素操作
  endResize() {
    this.isResizing = false;
    this.resizeElements = [];
    this.resizeType = "";
  }

  // 处理按下拖拽元素四个伸缩手柄事件
  handleElementDragMousedown(e, corner) {
    if (this.resizeElements.length === 1) {
      let resizeElement = this.resizeElements[0];
      let centerPos = getElementCenterPoint(resizeElement);
      let pos = getElementRotatedCornerPoint(resizeElement, corner);
      // 对角点的坐标
      this.diagonalPoint.x = 2 * centerPos.x - pos.x;
      this.diagonalPoint.y = 2 * centerPos.y - pos.y;
      // 鼠标按下位置和元素的左上角坐标差值
      this.mousedownPosAndElementPosOffset.x = e.clientX - pos.x;
      this.mousedownPosAndElementPosOffset.y = this.app.coordinate.addScrollY(
        e.clientY - pos.y
      );
      resizeElement.saveState();
    }
    return this;
  }

  // 调整元素
  handleResizeElement(e, mx, my, offsetX, offsetY) {
    let resizeType = this.resizeType;
    // 按住了拖拽元素内部
    if (resizeType === DRAG_ELEMENT_PARTS.BODY) {
      this.handleMoveElement(offsetX, offsetY);
    } else if (resizeType === DRAG_ELEMENT_PARTS.ROTATE) {
      // 按住了拖拽元素的旋转按钮
      this.handleRotateElement(e, mx, my);
    } else if (resizeType === DRAG_ELEMENT_PARTS.TOP_LEFT_BTN) {
      // 按住左上角伸缩元素
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (newCenter.x - rp.x) * 2,
            height: (newCenter.y - rp.y) * 2,
          };
        },
        (rp) => {
          return {
            x: rp.x,
            y: rp.y,
          };
        }
      );
    } else if (resizeType === DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN) {
      // 按住右上角伸缩元素
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (rp.x - newCenter.x) * 2,
            height: (newCenter.y - rp.y) * 2,
          };
        },
        (rp, newSize) => {
          return {
            x: rp.x - newSize.width,
            y: rp.y,
          };
        }
      );
    } else if (resizeType === DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN) {
      // 按住右下角伸缩元素
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (rp.x - newCenter.x) * 2,
            height: (rp.y - newCenter.y) * 2,
          };
        },
        (rp, newSize) => {
          return {
            x: rp.x - newSize.width,
            y: rp.y - newSize.height,
          };
        }
      );
    } else if (resizeType === DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN) {
      // 按住左下角伸缩元素
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (newCenter.x - rp.x) * 2,
            height: (rp.y - newCenter.y) * 2,
          };
        },
        (rp, newSize) => {
          return {
            x: rp.x,
            y: rp.y - newSize.height,
          };
        }
      );
    }
    return this;
  }

  // 移动元素整体
  handleMoveElement(offsetX, offsetY) {
    this.resizeElements.forEach((element) => {
      element.move(offsetX, offsetY);
    });
    this.render();
    return this;
  }

  // 旋转元素
  handleRotateElement(e, mx, my) {
    let resizeElement = this.resizeElements[0];
    // 获取元素中心点
    let centerPos = getElementCenterPoint(resizeElement);
    // 获取鼠标移动的角度
    let rotate = getTowPointRotate(
      centerPos.x,
      centerPos.y,
      e.clientX,
      this.app.coordinate.addScrollY(e.clientY),
      mx,
      my
    );
    resizeElement.offsetRotate(rotate);
    this.render();
    return this;
  }

  // 伸缩元素
  handleStretchElement(e, calcSize, calcPos) {
    let resizeElement = this.resizeElements[0];
    let actClientX = e.clientX - this.mousedownPosAndElementPosOffset.x;
    let actClientY = this.app.coordinate.addScrollY(
      e.clientY - this.mousedownPosAndElementPosOffset.y
    );
    // 新的中心点
    let newCenter = {
      x: (actClientX + this.diagonalPoint.x) / 2,
      y: (actClientY + this.diagonalPoint.y) / 2,
    };
    // 获取当前鼠标位置经新的中心点反向旋转元素的角度后的坐标
    let rp = transformPointReverseRotate(
      actClientX,
      actClientY,
      newCenter.x,
      newCenter.y,
      resizeElement.rotate
    );
    // 计算新尺寸
    let newSize = calcSize(newCenter, rp);
    // 判断是否翻转了，不允许翻转
    let isWidthReverse = false;
    if (newSize.width < 0) {
      newSize.width = 0;
      isWidthReverse = true;
    }
    let isHeightReverse = false;
    if (newSize.height < 0) {
      newSize.height = 0;
      isHeightReverse = true;
    }
    // 计算新位置
    let newPos = calcPos(rp, newSize);
    // 元素和拖拽元素之间存在一点间距
    let newRect = {
      x: newPos.x,
      y: newPos.y,
      width: newSize.width,
      height: newSize.height,
    };
    // 如果翻转了，那么位置保持为上一次的位置
    if (isWidthReverse || isHeightReverse) {
      newRect.x = resizeElement.x;
      newRect.y = resizeElement.y;
    }
    // 更新尺寸位置信息
    resizeElement.updateRect(
      newRect.x,
      newRect.y,
      newRect.width,
      newRect.height
    );
    this.render();
    return this;
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
