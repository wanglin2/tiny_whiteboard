import { degToRad, radToDeg, getFontString, splitTextLines } from "./utils";

export default class DrawShap {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;
    this.style = {
      lineWidth: 2,
    };
    this.tmpStyle = {};
  }

  // 设置本次绘制的样式
  setCurrentStyle(style) {
    this.tmpStyle = style
  }

  // 处理样式数据
  handleStyle(style) {
    Object.keys(style).forEach((key) => {
      // 处理线条宽度
      if (key === 'lineWidth') {
        if (style[key] === 'small') {
          style[key] = 2;
        } else if (style[key] === 'middle') {
          style[key] = 4;
        } else if (style[key] === 'large') {
          style[key] = 6;
        }
      }
    })
    return style;
  }

  // 设置绘图样式
  setStyle() {
    let _style = this.handleStyle({
      ...this.style,
      ...this.tmpStyle
    });
    Object.keys(_style).forEach((key) => {
      if (key === 'lineDash') {
        if (_style.lineDash > 0) {
          this.ctx.setLineDash([_style.lineDash]);
        }
      } else {  
        this.ctx[key] = _style[key];
      }
    });
  }

  // 绘制公共操作
  drawWrap(fn, noResetStyle) {
    this.ctx.save();
    this.ctx.beginPath();
    this.setStyle();
    fn();
    this.ctx.stroke();
    this.ctx.restore();
    if (!noResetStyle) {
      this.setCurrentStyle({});
    }
  }

  // 绘制矩形
  drawRect(x, y, width, height) {
    this.drawWrap(() => {
      this.ctx.rect(x, y, width, height);
      if (this.tmpStyle.fillStyle) {
        this.ctx.fillRect(x, y, width, height);
      }
    });
  }

  // 绘制菱形
  drawDiamond(x, y, width, height) {
    this.drawWrap(() => {
      this.ctx.moveTo(x + width / 2, y);
      this.ctx.lineTo(x + width, y + height / 2);
      this.ctx.lineTo(x + width / 2, y + height);
      this.ctx.lineTo(x, y + height / 2);
      this.ctx.closePath();
      if (this.tmpStyle.fillStyle) {
        this.ctx.fill();
      }
    });
  }

  // 绘制三角形
  drawTriangle(x, y, width, height) {
    this.drawWrap(() => {
      this.ctx.moveTo(x + width / 2, y);
      this.ctx.lineTo(x + width, y + height);
      this.ctx.lineTo(x, y + height);
      this.ctx.closePath();
      if (this.tmpStyle.fillStyle) {
        this.ctx.fill();
      }
    });
  }

  // 绘制圆形
  drawCircle(x, y, r) {
    this.drawWrap(() => {
      this.ctx.arc(x, y, r, 0, 2 * Math.PI);
      if (this.tmpStyle.fillStyle) {
        this.ctx.fill();
      }
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

  // 绘制箭头
  drawArrow(pointArr) {
    let x = pointArr[0][0];
    let y = pointArr[0][1];
    let tx = pointArr[pointArr.length - 1][0];
    let ty = pointArr[pointArr.length - 1][1];
    this.drawWrap(() => {
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(tx, ty);
    }, true);
    let l = 30;
    let deg = 30;
    let lineDeg = radToDeg(Math.atan2(ty - y, tx - x));
    this.drawWrap(() => {
      let plusDeg = deg - lineDeg;
      let _x = tx - l * Math.cos(degToRad(plusDeg));
      let _y = ty + l * Math.sin(degToRad(plusDeg));
      this.ctx.moveTo(_x, _y);
      this.ctx.lineTo(tx, ty);
    }, true);
    this.drawWrap(() => {
      let plusDeg = 90 - lineDeg - deg;
      let _x = tx - l * Math.sin(degToRad(plusDeg));
      let _y = ty - l * Math.cos(degToRad(plusDeg));
      this.ctx.moveTo(_x, _y);
      this.ctx.lineTo(tx, ty);
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
          nextPoint[2],
          true
        );
      }, true);
    }
    this.setCurrentStyle({});
  }

  // 绘制线段
  drawLineSegment(mx, my, tx, ty, lineWidth = 0, noResetStyle) {
    this.drawWrap(() => {
      if (lineWidth > 0) {
        this.ctx.lineWidth = lineWidth;
      }
      this.ctx.moveTo(mx, my);
      this.ctx.lineTo(tx, ty);
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
    }, noResetStyle);
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

  // 绘制文字
  drawText(textObj, x, y, width, height) {
    let { text, fontSize, fontFamily, lineHeightRatio } = textObj;
    let lineHeight = fontSize * lineHeightRatio;
    this.drawWrap(() => {
      this.ctx.font = getFontString(fontSize, fontFamily);
      this.ctx.textBaseline = "middle";
      let textArr = splitTextLines(text);
      textArr.forEach((textRow, index) => {
        this.ctx.fillText(
          textRow,
          x,
          y + (index * lineHeight + lineHeight / 2)
        );
      });
    });
  }

  // 绘制图片
  drawImage(element, x, y, width, height) {
    this.drawWrap(() => {
      let ratio = width / height;
      let showWidth = 0;
      let showHeight = 0;
      if (ratio > element.ratio) {
        showHeight = height;
        showWidth = element.ratio * height;
      } else {
        showWidth = width;
        showHeight = width / element.ratio;
      }
      this.ctx.drawImage(element.imageObj, x, y, showWidth, showHeight);
    });
  }
}
