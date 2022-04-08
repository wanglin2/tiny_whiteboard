import Rectangle from "./elements/Rectangle";

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

  // 设置当前激活元素
  setActiveElement(element) {
    if (!this.activeElements.includes(element)) {
      this.activeElements.push(element);
    }
    this.app.emit("activeElementChange", this.activeElements);
    return this;
  }

  // 清除当前激活元素
  clearActiveElements() {
    this.activeElements = [];
    this.render();
    return this;
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
    this.setActiveElement(element);
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
}
