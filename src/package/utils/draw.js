import { degToRad, radToDeg, getFontString, splitTextLines } from "./";

// 图形绘制工具方法

// 绘制公共操作
export const drawWrap = (ctx, fn, fill = false) => {
  ctx.beginPath();
  fn();
  ctx.stroke();
  if (fill) {
    ctx.fill();
  }
};

// 绘制矩形
export const drawRect = (ctx, x, y, width, height, fill = false) => {
  drawWrap(ctx, () => {
    ctx.rect(x, y, width, height);
    if (fill) {
      ctx.fillRect(x, y, width, height);
    }
  });
};

// 绘制菱形
export const drawDiamond = (ctx, x, y, width, height, fill = false) => {
  drawWrap(
    ctx,
    () => {
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x + width / 2, y + height);
      ctx.lineTo(x, y + height / 2);
      ctx.closePath();
    },
    fill
  );
};

// 绘制三角形
export const drawTriangle = (ctx, x, y, width, height, fill = false) => {
  drawWrap(
    ctx,
    () => {
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
    },
    fill
  );
};

// 绘制圆形
export const drawCircle = (ctx, x, y, r, fill = false) => {
  drawWrap(
    ctx,
    () => {
      ctx.arc(x, y, r, 0, 2 * Math.PI);
    },
    fill
  );
};

// 绘制折线
export const drawLine = (ctx, points) => {
  drawWrap(ctx, () => {
    let first = true;
    points.forEach((point) => {
      if (first) {
        first = false;
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    });
  });
};

// 绘制箭头
export const drawArrow = (ctx, pointArr) => {
  let x = pointArr[0][0];
  let y = pointArr[0][1];
  let tx = pointArr[pointArr.length - 1][0];
  let ty = pointArr[pointArr.length - 1][1];
  drawWrap(
    ctx,
    () => {
      ctx.moveTo(x, y);
      ctx.lineTo(tx, ty);
    },
    true
  );
  let l = 30;
  let deg = 30;
  let lineDeg = radToDeg(Math.atan2(ty - y, tx - x));
  drawWrap(
    ctx,
    () => {
      let plusDeg = deg - lineDeg;
      let _x = tx - l * Math.cos(degToRad(plusDeg));
      let _y = ty + l * Math.sin(degToRad(plusDeg));
      ctx.moveTo(_x, _y);
      ctx.lineTo(tx, ty);
    },
    true
  );
  drawWrap(ctx, () => {
    let plusDeg = 90 - lineDeg - deg;
    let _x = tx - l * Math.sin(degToRad(plusDeg));
    let _y = ty - l * Math.cos(degToRad(plusDeg));
    ctx.moveTo(_x, _y);
    ctx.lineTo(tx, ty);
  });
};

// 绘制自由线段
export const drawFreeLine = (ctx, points) => {
  for (let i = 0; i < points.length - 1; i++) {
    drawWrap(
      ctx,
      () => {
        let point = points[i];
        let nextPoint = points[i + 1];
        drawLineSegment(
          ctx,
          point[0],
          point[1],
          nextPoint[0],
          nextPoint[1],
          nextPoint[2],
          true
        );
      },
      true
    );
  }
};

// 绘制线段
export const drawLineSegment = (
  ctx,
  mx,
  my,
  tx,
  ty,
  lineWidth = 0,
  noResetStyle
) => {
  drawWrap(
    ctx,
    () => {
      if (lineWidth > 0) {
        ctx.lineWidth = lineWidth;
      }
      ctx.moveTo(mx, my);
      ctx.lineTo(tx, ty);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    },
    noResetStyle
  );
};

// 根据速度计算画笔粗细
export const computedLineWidthBySpeed = (speed, lastLineWidth) => {
  let lineWidth = 0;
  let maxLineWidth = style.lineWidth + 2;
  let maxSpeed = 10;
  let minSpeed = 0.5;

  // 速度超快，那么直接使用最小的笔画
  if (speed >= maxSpeed) {
    lineWidth = style.lineWidth;
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
};

// 绘制文字
export const drawText = (ctx, textObj, x, y, width, height) => {
  let { text, fontSize, fontFamily, lineHeightRatio } = textObj;
  let lineHeight = fontSize * lineHeightRatio;
  drawWrap(ctx, () => {
    ctx.font = getFontString(fontSize, fontFamily);
    ctx.textBaseline = "middle";
    let textArr = splitTextLines(text);
    textArr.forEach((textRow, index) => {
      ctx.fillText(textRow, x, y + (index * lineHeight + lineHeight / 2));
    });
  });
};

// 绘制图片
export const drawImage = (ctx, element, x, y, width, height) => {
  drawWrap(ctx, () => {
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
    ctx.drawImage(element.imageObj, x, y, showWidth, showHeight);
  });
};
