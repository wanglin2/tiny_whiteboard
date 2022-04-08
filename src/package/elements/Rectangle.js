import BaseElement from "./BaseElement";
import { drawRect } from '../utils/draw'

// 矩形元素类
export default class Rectangle extends BaseElement {
  constructor(...args) {
    super(...args);
  }

  // 渲染到画布
  render() {
    let { width, height } = this;
    this.warpRender(({ halfWidth, halfHeight }) => {
      // 画布中心点修改了，所以元素的坐标也要相应修改
      drawRect(this.ctx, -halfWidth, -halfHeight, width, height, true);
    });
  }
}
