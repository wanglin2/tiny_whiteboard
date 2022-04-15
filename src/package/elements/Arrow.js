import BaseMultiPointElement from "./BaseMultiPointElement";
import { drawArrow } from "../utils/draw";
import DragElement from "./DragElement";
import { transformPointOnElement } from "../utils";
import { checkIsAtArrowEdge } from "../utils/checkHit";

// 箭头元素类
export default class Arrow extends BaseMultiPointElement {
  constructor(...args) {
    super(...args);
    // 拖拽元素实例
    this.dragElement = new DragElement(this, this.app);
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
          this.app.coordinate.subScrollY(fictitiousPoint.y - cy)
        );
        realtimePoint = [[fx, fy]];
      }
      drawArrow(
        this.ctx,
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
    return checkIsAtArrowEdge(this, rp);
  }
}
