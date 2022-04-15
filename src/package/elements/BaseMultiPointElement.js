import { getBoundingRect, deepCopy } from "../utils";
import BaseElement from "./BaseElement";

// 基础多个点的组件的元素类
export default class BaseMultiPointElement extends BaseElement {
  constructor(opts = {}, app) {
    super(opts, app);
    // 记录初始点位，在拖动时
    this.startPointArr = [];
    // 点位
    this.pointArr = [];
    // 记录初始大小，用于缩放时
    this.startWidth = 0;
    this.startHeight = 0;
    // 鼠标当前实时位置，用于在绘制时显示线段最后一个点到当前鼠标的虚拟连接线
    this.fictitiousPoint = {
      x: 0,
      y: 0,
    };
  }

  // 添加坐标，具有多个坐标数据的图形，如线段、自由线
  addPoint(x, y, ...args) {
    if (!Array.isArray(this.pointArr)) {
      return;
    }
    this.pointArr.push([x, y, ...args]);
    return this;
  }

  // 更新元素包围框，用于具有多个坐标数据的图形
  updateMultiPointBoundingRect() {
    let rect = getBoundingRect(this.pointArr);
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
    return this;
  }

  // 更新虚拟坐标点
  updateFictitiousPoint(x, y) {
    this.fictitiousPoint.x = x;
    this.fictitiousPoint.y = y;
  }

  // 保存元素初始状态
  saveState() {
    let { rotate, x, y, width, height, pointArr } = this;
    this.startRotate = rotate;
    this.startX = x;
    this.startY = y;
    this.startPointArr = deepCopy(pointArr);
    this.startWidth = width;
    this.startHeight = height;
    return this;
  }

  // 移动元素
  move(ox, oy) {
    this.pointArr = this.startPointArr.map((point) => {
      return [point[0] + ox, point[1] + oy, ...point.slice(2)];
    });
    let { startX, startY } = this;
    this.x = startX + ox;
    this.y = startY + oy;
    return this;
  }

  // 更新元素包围框
  updateRect(x, y, width, height) {
    let { startWidth, startHeight, startPointArr } = this;
    // 获取收缩比例
    let scaleX = width / startWidth;
    let scaleY = height / startHeight;
    // 所有点位都进行同步缩放
    this.pointArr = startPointArr.map((point) => {
      let nx = point[0] * scaleX;
      let ny = point[1] * scaleY;
      return [nx, ny, ...point.slice(2)];
    });
    // 放大后会偏移拖拽元素，所以计算一下元素的新包围框和拖拽元素包围框的差距，然后绘制时整体往回偏移
    let rect = getBoundingRect(this.pointArr);
    let offsetX = rect.x - x;
    let offsetY = rect.y - y;
    this.pointArr = this.pointArr.map((point) => {
      return [point[0] - offsetX, point[1] - offsetY, ...point.slice(2)];
    });
    this.updatePos(x, y);
    this.updateSize(width, height);
    return this;
  }
}
