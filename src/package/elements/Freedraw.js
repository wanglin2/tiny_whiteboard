import BaseElement from "./BaseElement";
import { drawLineSegment, drawFreeLine } from "../utils/draw";
import DragElement from "./DragElement";
import { transformPointOnElement, deepCopy, getBoundingRect } from "../utils";
import { checkIsAtFreedrawLineEdge } from "../utils/checkHit";

// 只有画笔元素类
export default class Freedraw extends BaseElement {
  constructor(...args) {
    super(...args);
    // 拖拽元素实例
    this.dragElement = new DragElement(this, this.app);
    // 记录初始点位，在拖动时
    this.startPointArr = [];
    this.lastLineWidth = -1; // 上一次的线宽
    // 点位
    this.pointArr = []; // [[x,y,speed]]第三个数字为线宽
    // 记录初始大小，用于缩放时
    this.startWidth = 0;
    this.startHeight = 0;
  }

  // 渲染到画布
  render() {
    let { pointArr } = this;
    this.warpRender(({ cx, cy }) => {
      drawFreeLine(
        this.ctx,
        pointArr.map((point) => {
          // 屏幕坐标在左上角，画布坐标在中心，所以屏幕坐标要先转成画布坐标
          let { x, y } = this.app.coordinate.transform(point[0], point[1]);
          // 绘制前原点又由屏幕中心移动到了元素中心，所以还需要再转一次
          return [x - cx, y - cy, ...point.slice(2)];
        })
      );
    });
    // 激活时显示拖拽框
    if (this.isActive && !this.isCreating) {
      this.dragElement.render();
    }
  }

  // 检测是否被击中
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this);
    return checkIsAtFreedrawLineEdge(this, rp);
  }

  // 绘制单条线段
  singleRender(mx, my, tx, ty, lineWidth) {
    this.ctx.save();
    drawLineSegment(this.ctx, mx, my, tx, ty, lineWidth);
    this.ctx.restore();
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
