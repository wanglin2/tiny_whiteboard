import BaseElement from "./BaseElement";
import { drawTriangle } from "../utils/draw";
import DragElement from "./DragElement";
import {
  transformPointOnElement,
  getElementCenterPoint,
  getRotatedPoint,
} from "../utils";
import { checkIsAtTriangleEdge } from "../utils/checkHit";

// 三角形元素类
export default class Triangle extends BaseElement {
  constructor(...args) {
    super(...args);
    // 拖拽元素实例
    this.dragElement = new DragElement(this, this.app);
  }

  // 渲染到画布
  render() {
    let { width, height } = this;
    this.warpRender(({ halfWidth, halfHeight }) => {
      // 画布中心点修改了，所以元素的坐标也要相应修改
      drawTriangle(this.app.ctx, -halfWidth, -halfHeight, width, height, true);
    });
    // 激活时显示拖拽框
    this.renderDragElement();
  }

  // 检测是否被击中
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this);
    return checkIsAtTriangleEdge(this, rp);
  }

  // 获取图形应用了旋转之后的端点列表
  getEndpointList() {
    let { x, y, width, height, rotate } = this;
    let points = [
      [x + width / 2, y],
      [x + width, y + height],
      [x, y + height],
    ];
    let center = getElementCenterPoint(this);
    return points.map((point) => {
      return getRotatedPoint(point[0], point[1], center.x, center.y, rotate);
    });
  }
}
