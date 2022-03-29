import { checkIsAtSegment } from "./utils";

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
      switch (element.type) {
        case "rectangle":
          this.drawShape.drawRect(
            element.x,
            element.y,
            element.width,
            element.height
          );
          break;
        default:
          break;
      }
    });
    this.app.dragElement.render();
  }

  // 检测指定位置的元素
  checkElementsAtPos(x, y) {
    let res = null;
    this.elementList.forEach((element) => {
      if (res) return;
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
          if (checkIsAtSegment(x, y, ...seg)) {
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

  // 偏移激活元素初始坐标
  offsetActiveElementPos(ox, oy) {
    this.activeElement.x = this.activeElement.startX + ox;
    this.activeElement.y = this.activeElement.startY + oy;
  }

  // 设置激活元素尺寸
  setActiveElementSize(width, height) {
    this.activeElement.width = width;
    this.activeElement.height = height;
  }
}
