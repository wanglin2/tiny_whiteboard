// 通用工具方法

// 创建canvas元素
export const createCanvas = (
  width,
  height,
  opt = { noStyle: false, noTranslate: false, className: '' }
) => {
  let canvas = document.createElement('canvas')
  if (!opt.noStyle) {
    canvas.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
    `
  }
  if (opt.className) {
    canvas.className = opt.className
  }
  // 获取绘图上下文
  let ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  // 画布原点移动到画布中心
  if (!opt.noTranslate) {
    ctx.translate(canvas.width / 2, canvas.height / 2)
  }
  return {
    canvas,
    ctx
  }
}

// 计算两点之间的距离
export const getTowPointDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

// 计算点到直线的距离
export const getPointToLineDistance = (x, y, x1, y1, x2, y2) => {
  // 直线垂直于x轴
  if (x1 === x2) {
    return Math.abs(x - x1)
  } else {
    let B = 1
    let A, C
    A = (y1 - y2) / (x2 - x1)
    C = 0 - B * y1 - A * x1
    return Math.abs((A * x + B * y + C) / Math.sqrt(A * A + B * B))
  }
}

// 检查是否点击到了一条线段
export const checkIsAtSegment = (x, y, x1, y1, x2, y2, dis = 10) => {
  if (getPointToLineDistance(x, y, x1, y1, x2, y2) > dis) {
    return false
  }
  let dis1 = getTowPointDistance(x, y, x1, y1)
  let dis2 = getTowPointDistance(x, y, x2, y2)
  let dis3 = getTowPointDistance(x1, y1, x2, y2)
  let max = Math.sqrt(dis * dis + dis3 * dis3)
  if (dis1 <= max && dis2 <= max) {
    return true
  }
  return false
}

// 弧度转角度
export const radToDeg = rad => {
  return rad * (180 / Math.PI)
}

// 角度转弧度
export const degToRad = deg => {
  return deg * (Math.PI / 180)
}

// 计算中心点相同的两个坐标相差的角度
export const getTowPointRotate = (cx, cy, tx, ty, fx, fy) => {
  return radToDeg(Math.atan2(ty - cy, tx - cx) - Math.atan2(fy - cy, fx - cx))
}

// 获取坐标经指定中心点旋转指定角度的坐标，顺时针还是逆时针rotate传正负即可
export const getRotatedPoint = (x, y, cx, cy, rotate) => {
  let deg = radToDeg(Math.atan2(y - cy, x - cx))
  let del = deg + rotate
  let dis = getTowPointDistance(x, y, cx, cy)
  return {
    x: Math.cos(degToRad(del)) * dis + cx,
    y: Math.sin(degToRad(del)) * dis + cy
  }
}

// 获取元素的中心点坐标
export const getElementCenterPoint = element => {
  let { x, y, width, height } = element
  return {
    x: x + width / 2,
    y: y + height / 2
  }
}

// 以指定中心点反向旋转坐标指定角度
export const transformPointReverseRotate = (x, y, cx, cy, rotate) => {
  if (rotate !== 0) {
    let rp = getRotatedPoint(x, y, cx, cy, -rotate)
    x = rp.x
    y = rp.y
  }
  return {
    x,
    y
  }
}

// 根据元素是否旋转了处理鼠标坐标，如果元素旋转了，那么鼠标坐标要反向旋转回去
export const transformPointOnElement = (x, y, element) => {
  let center = getElementCenterPoint(element)
  return transformPointReverseRotate(x, y, center.x, center.y, element.rotate)
}

// 获取元素的四个角坐标
export const getElementCornerPoint = (element, dir) => {
  let { x, y, width, height } = element
  switch (dir) {
    case 'topLeft':
      return {
        x,
        y
      }
    case 'topRight':
      return {
        x: x + width,
        y
      }
    case 'bottomRight':
      return {
        x: x + width,
        y: y + height
      }
    case 'bottomLeft':
      return {
        x,
        y: y + height
      }
    default:
      break
  }
}

// 获取元素旋转后的四个角坐标
export const getElementRotatedCornerPoint = (element, dir) => {
  let center = getElementCenterPoint(element)
  let dirPos = getElementCornerPoint(element, dir)
  return getRotatedPoint(dirPos.x, dirPos.y, center.x, center.y, element.rotate)
}

// 判断一个坐标是否在一个矩形内
// 第三个参数可以直接传一个带有x、y、width、height的元素对象
export const checkPointIsInRectangle = (x, y, rx, ry, rw, rh) => {
  if (typeof rx === 'object') {
    let element = rx
    rx = element.x
    ry = element.y
    rw = element.width
    rh = element.height
  }
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh
}

// 获取多个点的外包围框
export const getBoundingRect = (pointArr = [], returnCorners = false) => {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  pointArr.forEach(point => {
    let [x, y] = point
    if (x < minX) {
      minX = x
    }
    if (x > maxX) {
      maxX = x
    }
    if (y < minY) {
      minY = y
    }
    if (y > maxY) {
      maxY = y
    }
  })
  let x = minX
  let y = minY
  let width = maxX - minX
  let height = maxY - minY
  // 以四个角坐标方式返回
  if (returnCorners) {
    return [
      {
        x,
        y
      },
      {
        x: x + width,
        y
      },
      {
        x: x + width,
        y: y + height
      },
      {
        x,
        y: y + height
      }
    ]
  }
  return {
    x,
    y,
    width,
    height
  }
}

// 简单深拷贝
export const deepCopy = obj => {
  return JSON.parse(JSON.stringify(obj))
}

// 拼接文字字体字号字符串
export const getFontString = (fontSize, fontFamily) => {
  return `${fontSize}px ${fontFamily}`
}

// 文本切割成行
export const splitTextLines = text => {
  return text.replace(/\r\n?/g, '\n').split('\n')
}

// 计算文本的实际渲染宽度
let textCheckEl = null
export const getTextActWidth = (text, style) => {
  if (!textCheckEl) {
    textCheckEl = createCanvas(300,200)
    textCheckEl.ctx.textBaseline = "middle"
  }
  textCheckEl.ctx.font = `${style.fontSize}px ${style.fontFamily}`
  textCheckEl.ctx.fillText(text, 0, 0)
  return textCheckEl.ctx.measureText(text).width
}

// 计算固定宽度内能放下所有文字的最大字号
export const getMaxFontSizeInWidth = (text, width, style) => {
  let fontSize = 12
  while (
    getTextActWidth(text, {
      ...style,
      fontSize: fontSize + 1
    }) < width
  ) {
    fontSize++
  }
  return fontSize
}

// 计算换行文本的实际宽度
export const getWrapTextActWidth = element => {
  let { text } = element
  let textArr = splitTextLines(text)
  let maxWidth = -Infinity
  textArr.forEach(textRow => {
    let width = getTextActWidth(textRow, element.style)
    if (width > maxWidth) {
      maxWidth = width
    }
    if (textCheckEl) {
      const {canvas, ctx} = textCheckEl
      ctx.clearRect(-canvas.width / 2, -canvas.width / 2, canvas.width * 2, canvas.width * 2)
    }
  })
  return maxWidth
}

// 计算换行文本的最长一行的文字数量
export const getWrapTextMaxRowTextNumber = text => {
  let textArr = splitTextLines(text)
  let maxNumber = -Infinity
  textArr.forEach(textRow => {
    if (textRow.length > maxNumber) {
      maxNumber = textRow.length
    }
  })
  return maxNumber
}

// 计算一个文本元素的宽高
export const getTextElementSize = element => {
  let { text, style } = element
  let width = getWrapTextActWidth(element)
  const lines = Math.max(splitTextLines(text).length, 1)
  let lineHeight = style.fontSize * style.lineHeightRatio
  let height = lines * lineHeight
  return {
    width,
    height
  }
}

// 节流函数
export const throttle = (fn, ctx, time = 100) => {
  let timer = null
  return (...args) => {
    if (timer) {
      return
    }
    timer = setTimeout(() => {
      fn.call(ctx, ...args)
      timer = null
    }, time)
  }
}

// 根据速度计算画笔粗细
export const computedLineWidthBySpeed = (
  speed,
  lastLineWidth,
  baseLineWidth = 2
) => {
  let lineWidth = 0
  let maxLineWidth = baseLineWidth
  let maxSpeed = 10
  let minSpeed = 0.5
  // 速度超快，那么直接使用最小的笔画
  if (speed >= maxSpeed) {
    lineWidth = baseLineWidth
  } else if (speed <= minSpeed) {
    // 速度超慢，那么直接使用最大的笔画
    lineWidth = maxLineWidth + 1
  } else {
    // 中间速度，那么根据速度的比例来计算
    lineWidth =
      maxLineWidth - ((speed - minSpeed) / (maxSpeed - minSpeed)) * maxLineWidth
  }
  if (lastLineWidth === -1) {
    lastLineWidth = maxLineWidth
  }
  // 最终的粗细为计算出来的一半加上上一次粗细的一半，防止两次粗细相差过大，出现明显突变
  return lineWidth * (1 / 2) + lastLineWidth * (1 / 2)
}

// 下载文件
export const downloadFile = (file, fileName) => {
  let a = document.createElement('a')
  a.href = file
  a.download = fileName
  a.click()
}

// 获取元素的四个角的坐标，应用了旋转之后的
export const getElementCorners = element => {
  // 左上角
  let topLeft = getElementRotatedCornerPoint(element, 'topLeft')
  // 右上角
  let topRight = getElementRotatedCornerPoint(element, 'topRight')
  // 左下角
  let bottomLeft = getElementRotatedCornerPoint(element, 'bottomLeft')
  // 右下角
  let bottomRight = getElementRotatedCornerPoint(element, 'bottomRight')
  return [topLeft, topRight, bottomLeft, bottomRight]
}

// 获取多个元素的最外层包围框信息
export const getMultiElementRectInfo = (elementList = []) => {
  if (elementList.length <= 0) {
    return {
      minx: 0,
      maxx: 0,
      miny: 0,
      maxy: 0
    }
  }
  let minx = Infinity
  let maxx = -Infinity
  let miny = Infinity
  let maxy = -Infinity
  elementList.forEach(element => {
    let pointList = element.getEndpointList()
    pointList.forEach(({ x, y }) => {
      if (x < minx) {
        minx = x
      }
      if (x > maxx) {
        maxx = x
      }
      if (y < miny) {
        miny = y
      }
      if (y > maxy) {
        maxy = y
      }
    })
  })
  return {
    minx,
    maxx,
    miny,
    maxy
  }
}

// 创建图片对象
export const createImageObj = url => {
  return new Promise(resolve => {
    let img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.onload = () => {
      resolve(img)
    }
    img.onerror = () => {
      resolve(null)
    }
    img.src = url
  })
}

// 元素的唯一key
let nodeKeyIndex = 0
export const createNodeKey = () => {
  return nodeKeyIndex++
}
