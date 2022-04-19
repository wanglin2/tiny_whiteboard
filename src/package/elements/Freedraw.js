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
        this.app.ctx,
        pointArr,
        {
          app: this.app,
          cx,
          cy
        }
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
    this.app.ctx.save();
    drawLineSegment(this.app.ctx, mx, my, tx, ty, lineWidth);
    this.app.ctx.restore();
  }
}
