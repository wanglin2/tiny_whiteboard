import BaseMultiPointElement from "./BaseMultiPointElement";
import { drawLineSegment, drawFreeLine } from "../utils/draw";
import DragElement from "./DragElement";
import { transformPointOnElement, deepCopy, getBoundingRect } from "../utils";
import { checkIsAtFreedrawLineEdge } from "../utils/checkHit";

// 只有画笔元素类
export default class Freedraw extends BaseMultiPointElement {
  constructor(...args) {
    super(...args);
    // 拖拽元素实例
    this.dragElement = new DragElement(this, this.app);
    // 点位[x,y,speed]第三个数字为线宽
    // 上一次的线宽
    this.lastLineWidth = -1; 
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
}
