import { createCanvas } from './utils'

// 画布类
export default class Canvas {
  constructor(width, height, opt) {
    this.width = width
    this.height = height
    let { canvas, ctx } = createCanvas(width, height, opt)
    this.el = canvas
    this.ctx = ctx
  }

  // 清除画布
  clearCanvas() {
    let { width, height } = this
    this.ctx.clearRect(-width / 2, -height / 2, width, height)
  }
}
