import Canvas from './Canvas'

// 网格
export default class Grid {
  constructor(app) {
    this.app = app
    this.canvas = null
    this.ctx = null

    this.init()
    this.app.on('zoomChange', this.renderGrid, this)
    this.app.on('scrollChange', this.renderGrid, this)
  }

  // 初始化
  init() {
    if (this.canvas) {
      this.app.container.removeChild(this.canvas.el)
    }
    let { width, height } = this.app
    this.canvas = new Canvas(width, height, {
      className: 'grid'
    })
    this.ctx = this.canvas.ctx
    this.app.container.insertBefore(
      this.canvas.el,
      this.app.container.children[0]
    )
  }

  // 绘制水平线
  drawHorizontalLine(i) {
    let { coordinate, width, state } = this.app
    let _i = coordinate.subScrollY(i)
    this.ctx.beginPath()
    this.ctx.moveTo(-width / state.scale / 2, _i)
    this.ctx.lineTo(width / state.scale / 2, _i)
    this.ctx.stroke()
  }

  // 渲染水平线
  renderHorizontalLines() {
    let { coordinate, height, state } = this.app
    let { gridConfig, scale } = state
    let maxBottom = 0
    for (let i = -height / 2; i < height / 2; i += gridConfig.size) {
      this.drawHorizontalLine(i)
      maxBottom = i
    }
    // 向下滚时绘制上方超出的线
    for (
      let i = -height / 2 - gridConfig.size;
      i > -coordinate.subScrollY(height / scale / 2);
      i -= gridConfig.size
    ) {
      this.drawHorizontalLine(i)
    }
    // 向上滚时绘制下方超出的线
    for (
      let i = maxBottom + gridConfig.size;
      i < coordinate.addScrollY(height / scale / 2);
      i += gridConfig.size
    ) {
      this.drawHorizontalLine(i)
    }
  }

  // 绘制重置线
  drawVerticalLine(i) {
    let { coordinate, height, state } = this.app
    let _i = coordinate.subScrollX(i)
    this.ctx.beginPath()
    this.ctx.moveTo(_i, -height / state.scale / 2)
    this.ctx.lineTo(_i, height / state.scale / 2)
    this.ctx.stroke()
  }

  // 渲染垂直线
  renderVerticalLines() {
    let { coordinate, width, state } = this.app
    let { gridConfig, scale } = state
    let maxRight = 0
    for (let i = -width / 2; i < width / 2; i += gridConfig.size) {
      this.drawVerticalLine(i)
      maxRight = i
    }
    // 向右滚时绘制左方超出的线
    for (
      let i = -width / 2 - gridConfig.size;
      i > -coordinate.subScrollX(width / scale / 2);
      i -= gridConfig.size
    ) {
      this.drawVerticalLine(i)
    }
    // 向左滚时绘制右方超出的线
    for (
      let i = maxRight + gridConfig.size;
      i < coordinate.addScrollX(width / scale / 2);
      i += gridConfig.size
    ) {
      this.drawVerticalLine(i)
    }
  }

  // 渲染网格
  renderGrid() {
    this.canvas.clearCanvas()
    let { gridConfig, scale, showGrid } = this.app.state
    if (!showGrid) {
      return
    }
    this.ctx.save()
    this.ctx.scale(scale, scale)
    this.ctx.strokeStyle = gridConfig.strokeStyle
    this.ctx.lineWidth = gridConfig.lineWidth

    // 水平
    this.renderHorizontalLines()

    // 垂直
    this.renderVerticalLines()

    this.ctx.restore()
  }

  // 显示网格
  showGrid() {
    this.app.updateState({
      showGrid: true
    })
    this.renderGrid()
  }

  // 隐藏网格
  hideGrid() {
    this.app.updateState({
      showGrid: false
    })
    this.canvas.clearCanvas()
  }

  // 更新网格配置
  updateGrid(config = {}) {
    this.app.updateState({
      gridConfig: {
        ...this.app.state.gridConfig,
        ...config
      }
    })
    if (this.app.state.showGrid) {
      this.hideGrid()
      this.showGrid()
    }
  }
}
