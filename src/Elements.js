import {
  checkIsAtSegment,
  degToRad,
  transformPointOnElement,
  getTowPointDistance,
} from "./utils";
import { HIT_DISTANCE } from "./constants";

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
      // 移动画布中点
      let cx = x + width / 2;
      let cy = y + height / 2;
      this.ctx.translate(cx, cy);
      this.ctx.rotate(degToRad(rotate));
      switch (element.type) {
        case "rectangle":
          this.drawShape.drawRect(-width / 2, -height / 2, width, height);
          break;
        case "circle":
          this.drawShape.drawCircle(0, 0, this.getCircleRadius(width, height));
          break;
        default:
          break;
      }
      this.ctx.restore();
    });
    this.app.dragElement.render();
  }

  // 创建元素
  createElement(type, x, y, rotate = 0) {
    return {
      type,
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

  // 根据宽高计算圆的半径
  getCircleRadius(width, height) {
    return Math.min(Math.abs(width), Math.abs(height)) / 2;
  }

  // 检测是否点击到矩形边缘
  checkIsAtRectangleEdge(element, rp) {
    let res = null;
    let { x, y, width, height } = element;
    let segments = [
      [x, y, x + width, y],
      [x + width, y, x + width, y + height],
      [x + width, y + height, x, y + height],
      [x, y + height, x, y],
    ];
    segments.forEach((seg) => {
      if (res) return;
      if (checkIsAtSegment(rp.x, rp.y, ...seg, HIT_DISTANCE)) {
        res = element;
      }
    });
    return res;
  }

  // 检测是否点击到圆的边缘
  checkIsAtCircleEdge(element, rp) {
    let { width, height, x, y } = element;
    let radius = this.getCircleRadius(width, height);
    let dis = getTowPointDistance(rp.x, rp.y, x + radius, y + radius);
    let onCircle = dis >= radius - HIT_DISTANCE && dis <= radius + HIT_DISTANCE;
    return onCircle ? element : null;
  }

  // 检测指定位置的元素
  checkElementsAtPos(x, y) {
    let res = null;
    this.elementList.forEach((element) => {
      if (res) return;
      let rp = transformPointOnElement(x, y, element);
      if (element.type === "rectangle") {
        res = this.checkIsAtRectangleEdge(element, rp);
      } else if (element.type === "circle") {
        res = this.checkIsAtCircleEdge(element, rp);
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
