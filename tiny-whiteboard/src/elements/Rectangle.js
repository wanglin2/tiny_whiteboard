import BaseElement from './BaseElement'
import { drawRect } from '../utils/draw'
import DragElement from './DragElement'
import { transformPointOnElement } from '../utils'
import { checkIsAtRectangleEdge } from '../utils/checkHit'

// 矩形元素类
export default class Rectangle extends BaseElement {
  constructor(...args) {
    super(...args)
    // 拖拽元素实例
    this.dragElement = new DragElement(this, this.app)
  }

  // 渲染到画布
  render() {
    let { width, height } = this
    this.warpRender(({ halfWidth, halfHeight }) => {
      // 画布中心点修改了，所以元素的坐标也要相应修改
      drawRect(this.app.ctx, -halfWidth, -halfHeight, width, height, true)
    })
    // 激活时显示拖拽框
    this.renderDragElement()
  }

  // 检测是否被击中
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtRectangleEdge(this, rp)
  }
}
