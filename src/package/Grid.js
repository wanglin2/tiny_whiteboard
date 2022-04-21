import Canvas from "./Canvas";

// 网格
export default class Grid {
  constructor(app) {
    this.app = app;
    this.canvas = null;
    this.ctx = null;
    this.state = this.app.state;
    this.width = this.app.width;
    this.height = this.app.height;

    this.init();
  }

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

  // 显示网格
  showGrid() {
    let { gridConfig } = this.state;
    this.ctx.save();
    this.ctx.strokeStyle = gridConfig.strokeStyle;
    this.ctx.lineWidth = gridConfig.lineWidth;
    // 水平
    for (let i = -this.height / 2; i < this.height / 2; i += gridConfig.size) {
      this.ctx.beginPath();
      this.ctx.moveTo(-this.width / 2, i);
      this.ctx.lineTo(this.width / 2, i);
      this.ctx.stroke();
    }
    // 垂直
    for (let i = -this.width / 2; i < this.width / 2; i += gridConfig.size) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, -this.height / 2);
      this.ctx.lineTo(i, this.height / 2);
      this.ctx.stroke();
    }
    this.ctx.restore();
    this.app.updateState({
      showGrid: true,
    });
  }

  // 隐藏网格
  hideGrid() {
    this.canvas.clearCanvas();
    this.app.updateState({
      showGrid: false,
    });
  }

  // 更新网格配置
  updateGrid(config = {}) {
    this.app.updateState({
      gridConfig: {
        ...this.app.state.gridConfig,
        ...config,
      },
    });
    this.state = this.app.state;
    if (this.app.state.showGrid) {
      this.hideGrid();
      this.showGrid();
    }
  }
}
