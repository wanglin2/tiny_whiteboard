import { checkIsAtSegment, degToRad, transformPointOnElement } from "./utils";

export default class Elements {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;
    this.drawShape = app.drawShape;
    this.elementList = [];
    this.activeElement = null;
  }

  // 添加元素
  addElement(element) {
    this.elementList.push(element);
  }

  // 绘制所有元素
  render() {
    this.app.clearCanvas();
    this.elementList.forEach((element) => {
      let { x, y, width, height, rotate } = element;
      this.ctx.save();
      let cx = x + width / 2;
      let cy = y + height / 2;
      this.ctx.translate(cx, cy);
      this.ctx.rotate(degToRad(rotate));
      switch (element.type) {
        case "rectangle":
          this.drawShape.drawRect(-width / 2, -height / 2, width, height);
          break;
        default:
          break;
      }
      this.ctx.restore();
    });
    this.app.dragElement.render();
  }

  // 创建进行元素
  createRectangle(x, y, rotate = 0) {
    return {
      type: "rectangle",
      startX: 0,
      startY: 0,
      x,
      y,
      width: 0,
      height: 0,
      startRotate: 0,
      rotate,
    };
  }

  // 检测指定位置的元素
  checkElementsAtPos(x, y) {
    let res = null;
    this.elementList.forEach((element) => {
      if (res) return;
      let rp = transformPointOnElement(x, y, element);
      if (element.type === "rectangle") {
        let segments = [
          [element.x, element.y, element.x + element.width, element.y],
          [
            element.x + element.width,
            element.y,
            element.x + element.width,
            element.y + element.height,
          ],
          [
            element.x + element.width,
            element.y + element.height,
            element.x,
            element.y + element.height,
          ],
          [element.x, element.y + element.height, element.x, element.y],
        ];
        segments.forEach((seg) => {
          if (res) return;
          if (checkIsAtSegment(rp.x, rp.y, ...seg)) {
            res = element;
          }
        });
      }
    });
    return res;
  }

  // 保存激活元素初始坐标
  saveActiveElementPos() {
    this.activeElement.startX = this.activeElement.x;
    this.activeElement.startY = this.activeElement.y;
  }

  // 偏移激活元素坐标
  offsetActiveElementPos(ox, oy) {
    this.activeElement.x = this.activeElement.startX + ox;
    this.activeElement.y = this.activeElement.startY + oy;
  }

  // 更新激活元素尺寸
  updateActiveElementSize(width, height) {
    this.activeElement.width = width;
    this.activeElement.height = height;
  }

  // 更新激活元素坐标
  updateActiveElementPos(x, y) {
    this.activeElement.x = x;
    this.activeElement.y = y;
  }

  // 保存激活元素的初始角度
  saveActiveElementRotate() {
    this.activeElement.startRotate = this.activeElement.rotate;
  }

  // 偏移激活元素角度
  offsetActiveElementRotate(or) {
    this.activeElement.rotate = this.activeElement.startRotate + or;
  }
}
