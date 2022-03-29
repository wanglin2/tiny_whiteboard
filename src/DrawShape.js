export default class DrawShap {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;
  }

  // 绘制矩形
  drawRect(x, y, width, height, styles = {}) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    if (styles.lineDash) {
      this.ctx.setLineDash(styles.lineDash);
    }
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  }

  // 绘制圆形
  drawCircle(x, y, r) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  }
}
