import BaseElement from './BaseElement'
import { drawImage } from '../utils/draw'
import DragElement from './DragElement'
import { transformPointOnElement } from '../utils'
import { checkIsAtRectangleInner } from '../utils/checkHit'

// 图片元素类
export default class Image extends BaseElement {
  constructor(opts = {}, app) {
    super(opts, app)
    // 拖拽元素实例
    this.dragElement = new DragElement(this, this.app, {
      lockRatio: true
    })
    this.url = opts.url || ''
    this.imageObj = opts.imageObj || null
    this.ratio = opts.ratio || 1
  }

  // 序列化
  serialize() {
    let base = super.serialize()
    return {
      ...base,
      url: this.url,
      ratio: this.ratio
    }
  }

  // 渲染到画布
  render() {
    let { width, height } = this
    this.warpRender(({ halfWidth, halfHeight }) => {
      drawImage(this.app.ctx, this, -halfWidth, -halfHeight, width, height)
    })
    // 激活时显示拖拽框
    this.renderDragElement()
  }

  // 检测是否被击中
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtRectangleInner(this, rp)
  }
}
