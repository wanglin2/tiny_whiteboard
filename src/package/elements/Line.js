import BaseMultiPointElement from "./BaseMultiPointElement";
import { drawLine } from "../utils/draw";
import DragElement from "./DragElement";
import { transformPointOnElement } from "../utils";
import { checkIsAtLineEdge } from "../utils/checkHit";

// 线段/折线元素类
export default class Line extends BaseMultiPointElement {
  constructor(opts = {}, app) {
    super(opts, app);
    // 拖拽元素实例
    this.dragElement = new DragElement(this, this.app);
    // 是否是单线段，否则为多根线段组成的折线
    this.isSingle = opts.isSingle;
  }

  // 渲染到画布
  render() {
    let { pointArr, fictitiousPoint } = this;
    this.warpRender(({ cx, cy }) => {
      // 加上鼠标当前实时位置
      let realtimePoint = [];
      if (pointArr.length > 0 && this.isCreating) {
        let { x: fx, y: fy } = this.app.coordinate.transform(
          fictitiousPoint.x - cx,
          fictitiousPoint.y - cy
        );
        realtimePoint = [[fx, fy]];
      }
      drawLine(
        this.app.ctx,
        pointArr
          .map((point) => {
            // 屏幕坐标在左上角，画布坐标在中心，所以屏幕坐标要先转成画布坐标
            let { x, y } = this.app.coordinate.transform(point[0], point[1]);
            return [x - cx, y - cy];
          })
          .concat(realtimePoint)
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
    return checkIsAtLineEdge(this, rp);
  }
}
