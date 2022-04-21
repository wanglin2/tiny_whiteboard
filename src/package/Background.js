// 背景
export default class Background {
  constructor(app) {
    this.app = app;
  }

  // 设置背景
  set() {
    if (this.app.state.backgroundColor) {
      this.addBackgroundColor();
    } else {
      this.remove();
    }
  }

  // 添加背景颜色
  addBackgroundColor() {
    this.app.container.style.backgroundColor = this.app.state.backgroundColor;
  }

  // 移除背景
  remove() {
    this.app.container.style.backgroundColor = "";
  }

  // 在canvas内设置背景颜色，非css样式
  canvasAddBackgroundColor(ctx, width, height, backgroundColor) {
    // 背景颜色
    ctx.save();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = backgroundColor;
    ctx.fill();
    ctx.restore();
  }
}
