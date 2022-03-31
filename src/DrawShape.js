export default class DrawShap {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;
    this.style = {
      lineWidth: 2,
    };
  }

  // 设置绘图样式
  setStyle() {
    Object.keys(this.style).forEach((key) => {
      this.ctx[key] = this.style[key];
    });
  }

  // 绘制公共操作
  drawWrap(fn) {
    this.ctx.save();
    this.ctx.beginPath();
    this.setStyle();
    fn();
    this.ctx.stroke();
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
    });
  }

  // 绘制圆形
  drawCircle(x, y, r) {
    this.drawWrap(() => {
      this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    });
  }

  // 绘制折线
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
    });
  }

  // 绘制自由线段
  drawFreeLine(points) {
    for (let i = 0; i < points.length - 1; i++) {
      this.drawWrap(() => {
        let point = points[i];
        let nextPoint = points[i + 1];
        this.drawLineSegment(
          point[0],
          point[1],
          nextPoint[0],
          nextPoint[1],
          nextPoint[2]
        );
      });
    }
  }

  // 绘制线段
  drawLineSegment(mx, my, tx, ty, lineWidth) {
    this.drawWrap(() => {
      this.ctx.lineWidth = lineWidth;
      this.ctx.moveTo(mx, my);
      this.ctx.lineTo(tx, ty);
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
    });
  }

  // 根据速度计算画笔粗细
  computedLineWidthBySpeed(speed, lastLineWidth) {
    let lineWidth = 0;
    let maxLineWidth = this.style.lineWidth + 2;
    let maxSpeed = 10;
    let minSpeed = 0.5;

    // 速度超快，那么直接使用最小的笔画
    if (speed >= maxSpeed) {
      lineWidth = this.style.lineWidth;
    } else if (speed <= minSpeed) {
      // 速度超慢，那么直接使用最大的笔画
      lineWidth = maxLineWidth + 1;
    } else {
      // 中间速度，那么根据速度的比例来计算
      lineWidth =
        maxLineWidth -
        ((speed - minSpeed) / (maxSpeed - minSpeed)) * maxLineWidth;
    }
    if (lastLineWidth === -1) {
      lastLineWidth = maxLineWidth;
    }
    // 最终的粗细为计算出来的一半加上上一次粗细的一半，防止两次粗细相差过大，出现明显突变
    return lineWidth * (1 / 2) + lastLineWidth * (1 / 2);
  }
}
