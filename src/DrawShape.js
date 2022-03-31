export default class DrawShap {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;
  }

  // 绘制公共操作
  drawWrap(fn) {
    this.ctx.save();
    this.ctx.beginPath();

    fn();

    this.ctx.closePath();
    this.ctx.restore();
  }

  // 绘制矩形
  drawRect(x, y, width, height, styles = {}) {
    this.drawWrap(() => {
      this.ctx.rect(x, y, width, height);
      if (styles.lineDash) {
        this.ctx.setLineDash(styles.lineDash);
      }
      this.ctx.stroke();
    });
  }

  // 绘制圆形
  drawCircle(x, y, r) {
    this.drawWrap(() => {
      this.ctx.arc(x, y, r, 0, 2 * Math.PI);
      this.ctx.stroke();
    });
  }

  // 绘制
  drawLine(points) {
    this.drawWrap(() => {
      let first = true;
      points.forEach((point) => {
        if (first) {
          first = false;
          this.ctx.moveTo(point[0], point[1]);
        } else {
          this.ctx.lineTo(point[0], point[1]);
        }
      });
      this.ctx.stroke();
    });
  }
}
