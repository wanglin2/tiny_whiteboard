import { degToRad, radToDeg, getFontString, splitTextLines } from './'

// 图形绘制工具方法

// 绘制公共操作
export const drawWrap = (ctx, fn, fill = false) => {
  ctx.beginPath()
  fn()
  ctx.stroke()
  if (fill) {
    ctx.fill()
  }
}

// 绘制矩形
export const drawRect = (ctx, x, y, width, height, fill = false) => {
  drawWrap(ctx, () => {
    ctx.rect(x, y, width, height)
    if (fill) {
      ctx.fillRect(x, y, width, height)
    }
  })
}

// 绘制菱形
export const drawDiamond = (ctx, x, y, width, height, fill = false) => {
  drawWrap(
    ctx,
    () => {
      ctx.moveTo(x + width / 2, y)
      ctx.lineTo(x + width, y + height / 2)
      ctx.lineTo(x + width / 2, y + height)
      ctx.lineTo(x, y + height / 2)
      ctx.closePath()
    },
    fill
  )
}

// 绘制三角形
export const drawTriangle = (ctx, x, y, width, height, fill = false) => {
  drawWrap(
    ctx,
    () => {
      ctx.moveTo(x + width / 2, y)
      ctx.lineTo(x + width, y + height)
      ctx.lineTo(x, y + height)
      ctx.closePath()
    },
    fill
  )
}

// 绘制圆形
export const drawCircle = (ctx, x, y, r, fill = false) => {
  drawWrap(
    ctx,
    () => {
      ctx.arc(x, y, r, 0, 2 * Math.PI)
    },
    fill
  )
}

// 绘制折线
export const drawLine = (ctx, points) => {
  drawWrap(ctx, () => {
    let first = true
    points.forEach(point => {
      if (first) {
        first = false
        ctx.moveTo(point[0], point[1])
      } else {
        ctx.lineTo(point[0], point[1])
      }
    })
  })
}

// 绘制箭头
export const drawArrow = (ctx, pointArr) => {
  let x = pointArr[0][0]
  let y = pointArr[0][1]
  let tx = pointArr[pointArr.length - 1][0]
  let ty = pointArr[pointArr.length - 1][1]
  drawWrap(
    ctx,
    () => {
      ctx.moveTo(x, y)
      ctx.lineTo(tx, ty)
    },
    true
  )
  let l = 30
  let deg = 30
  let lineDeg = radToDeg(Math.atan2(ty - y, tx - x))
  drawWrap(
    ctx,
    () => {
      let plusDeg = deg - lineDeg
      let _x = tx - l * Math.cos(degToRad(plusDeg))
      let _y = ty + l * Math.sin(degToRad(plusDeg))
      ctx.moveTo(_x, _y)
      ctx.lineTo(tx, ty)
    },
    true
  )
  drawWrap(ctx, () => {
    let plusDeg = 90 - lineDeg - deg
    let _x = tx - l * Math.sin(degToRad(plusDeg))
    let _y = ty - l * Math.cos(degToRad(plusDeg))
    ctx.moveTo(_x, _y)
    ctx.lineTo(tx, ty)
  })
}

// 转换自由线段的点
const transformFreeLinePoint = (point, opt) => {
  // 屏幕坐标在左上角，画布坐标在中心，所以屏幕坐标要先转成画布坐标
  let { x, y } = opt.app.coordinate.transform(point[0], point[1])
  // 绘制前原点又由屏幕中心移动到了元素中心，所以还需要再转一次
  return [x - opt.cx, y - opt.cy, ...point.slice(2)]
}

// 绘制自由线段
export const drawFreeLine = (ctx, points, opt) => {
  for (let i = 0; i < points.length - 1; i++) {
    drawWrap(
      ctx,
      () => {
        // 在这里转换可以减少一次额外的遍历
        let point = transformFreeLinePoint(points[i], opt)
        let nextPoint = transformFreeLinePoint(points[i + 1], opt)
        drawLineSegment(
          ctx,
          point[0],
          point[1],
          nextPoint[0],
          nextPoint[1],
          nextPoint[2],
          true
        )
      },
      true
    )
  }
}

// 绘制线段
export const drawLineSegment = (ctx, mx, my, tx, ty, lineWidth = 0) => {
  drawWrap(ctx, () => {
    if (lineWidth > 0) {
      ctx.lineWidth = lineWidth
    }
    ctx.moveTo(mx, my)
    ctx.lineTo(tx, ty)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  })
}

// 绘制文字
export const drawText = (ctx, textObj, x, y, width, height) => {
  let { text, style } = textObj
  let lineHeight = style.fontSize * style.lineHeightRatio
  drawWrap(ctx, () => {
    ctx.font = getFontString(style.fontSize, style.fontFamily)
    ctx.textBaseline = 'middle'
    let textArr = splitTextLines(text)
    textArr.forEach((textRow, index) => {
      ctx.fillText(textRow, x, y + (index * lineHeight + lineHeight / 2))
    })
  })
}

// 绘制图片
export const drawImage = (ctx, element, x, y, width, height) => {
  drawWrap(ctx, () => {
    let ratio = width / height
    let showWidth = 0
    let showHeight = 0
    if (ratio > element.ratio) {
      showHeight = height
      showWidth = element.ratio * height
    } else {
      showWidth = width
      showHeight = width / element.ratio
    }
    ctx.drawImage(element.imageObj, x, y, showWidth, showHeight)
  })
}
