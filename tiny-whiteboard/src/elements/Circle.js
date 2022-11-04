import BaseElement from './BaseElement'
import { drawCircle } from '../utils/draw'
import DragElement from './DragElement'
import { transformPointOnElement } from '../utils'
import { getCircleRadius, checkIsAtCircleEdge } from '../utils/checkHit'

// 正圆元素类
export default class Circle extends BaseElement {
  constructor(...args) {
    super(...args)
    // 拖拽元素实例
    this.dragElement = new DragElement(this, this.app, {
      lockRatio: true
    })
  }

  // 渲染到画布
  render() {
    let { width, height } = this
    this.warpRender(({ halfWidth, halfHeight }) => {
      // 画布中心点修改了，所以元素的坐标也要相应修改
      drawCircle(this.app.ctx, 0, 0, getCircleRadius(width, height), true)
    })
    // 激活时显示拖拽框
    this.renderDragElement()
  }

  // 检测是否被击中
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtCircleEdge(this, rp)
  }
}
