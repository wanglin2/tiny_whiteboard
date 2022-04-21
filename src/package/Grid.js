import Canvas from "./Canvas";

// 网格
export default class Grid {
  constructor(app) {
    this.app = app;
    this.canvas = null;
    this.ctx = null;
    this.width = this.app.width;
    this.height = this.app.height;

    this.init();
    this.app.on("zoomChange", this.renderGrid, this);
    this.app.on("scrollChange", this.renderGrid, this);
  }

  // 初始化
  init() {
    this.canvas = new Canvas(this.width, this.height, {
      className: "grid",
    });
    this.ctx = this.canvas.ctx;
    this.app.container.insertBefore(
      this.canvas.el,
      this.app.container.children[0]
    );
  }

  // 绘制水平线
  renderHorizontalLine(i) {
    let _i = this.app.coordinate.subScrollY(i);
    this.ctx.beginPath();
    this.ctx.moveTo(-this.width / 2, _i);
    this.ctx.lineTo(this.width / 2, _i);
    this.ctx.stroke();
  }

  // 渲染网格
  renderGrid() {
    this.canvas.clearCanvas();
    let { gridConfig, scale, showGrid } = this.app.state;
    if (!showGrid) {
      return;
    }
    this.ctx.save();
    this.ctx.scale(scale, scale);
    this.ctx.strokeStyle = gridConfig.strokeStyle;
    this.ctx.lineWidth = gridConfig.lineWidth;

    // 水平
    for (let i = -this.height / 2; i < this.height / 2; i += gridConfig.size) {
      this.renderHorizontalLine(i);
    }
    // 向下滚时绘制上方超出的线
    for (
      let i = -this.height / 2;
      i > -this.app.coordinate.subScrollY(this.height / 2);
      i -= gridConfig.size
    ) {
      this.renderHorizontalLine(i);
    }
    // 向上滚时绘制下方超出的线
    for (
      let i = this.height / 2;
      i < this.app.coordinate.addScrollY(this.height / 2);
      i += gridConfig.size
    ) {
      this.renderHorizontalLine(i);
    }

    // 垂直
    for (let i = -this.width / 2; i < this.width / 2; i += gridConfig.size) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, -this.height / 2);
      this.ctx.lineTo(i, this.height / 2);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  // 显示网格
  showGrid() {
    this.app.updateState({
      showGrid: true,
    });
    this.renderGrid();
  }

  // 隐藏网格
  hideGrid() {
    this.app.updateState({
      showGrid: false,
    });
    this.canvas.clearCanvas();
  }

  // 更新网格配置
  updateGrid(config = {}) {
    this.app.updateState({
      gridConfig: {
        ...this.app.state.gridConfig,
        ...config,
      },
    });
    if (this.app.state.showGrid) {
      this.hideGrid();
      this.showGrid();
    }
  }
}
