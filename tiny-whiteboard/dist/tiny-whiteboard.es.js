var __defProp = Object.defineProperty
var __defProps = Object.defineProperties
var __getOwnPropDescs = Object.getOwnPropertyDescriptors
var __getOwnPropSymbols = Object.getOwnPropertySymbols
var __hasOwnProp = Object.prototype.hasOwnProperty
var __propIsEnum = Object.prototype.propertyIsEnumerable
var __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value
      })
    : (obj[key] = value)
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop])
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop])
    }
  return a
}
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b))
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = value => {
      try {
        step(generator.next(value))
      } catch (e) {
        reject(e)
      }
    }
    var rejected = value => {
      try {
        step(generator.throw(value))
      } catch (e) {
        reject(e)
      }
    }
    var step = x =>
      x.done
        ? resolve(x.value)
        : Promise.resolve(x.value).then(fulfilled, rejected)
    step((generator = generator.apply(__this, __arguments)).next())
  })
}
var eventemitter3 = { exports: {} }
;(function (module) {
  var has = Object.prototype.hasOwnProperty,
    prefix = '~'
  function Events() {}
  if (Object.create) {
    Events.prototype = /* @__PURE__ */ Object.create(null)
    if (!new Events().__proto__) prefix = false
  }
  function EE(fn, context, once) {
    this.fn = fn
    this.context = context
    this.once = once || false
  }
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function')
    }
    var listener = new EE(fn, context || emitter, once),
      evt = prefix ? prefix + event : event
    if (!emitter._events[evt])
      (emitter._events[evt] = listener), emitter._eventsCount++
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener)
    else emitter._events[evt] = [emitter._events[evt], listener]
    return emitter
  }
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events()
    else delete emitter._events[evt]
  }
  function EventEmitter2() {
    this._events = new Events()
    this._eventsCount = 0
  }
  EventEmitter2.prototype.eventNames = function eventNames() {
    var names = [],
      events,
      name
    if (this._eventsCount === 0) return names
    for (name in (events = this._events)) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name)
    }
    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events))
    }
    return names
  }
  EventEmitter2.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event,
      handlers = this._events[evt]
    if (!handlers) return []
    if (handlers.fn) return [handlers.fn]
    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn
    }
    return ee
  }
  EventEmitter2.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event,
      listeners = this._events[evt]
    if (!listeners) return 0
    if (listeners.fn) return 1
    return listeners.length
  }
  EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event
    if (!this._events[evt]) return false
    var listeners = this._events[evt],
      len = arguments.length,
      args,
      i
    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, void 0, true)
      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true
        case 2:
          return listeners.fn.call(listeners.context, a1), true
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true
      }
      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i]
      }
      listeners.fn.apply(listeners.context, args)
    } else {
      var length = listeners.length,
        j
      for (i = 0; i < length; i++) {
        if (listeners[i].once)
          this.removeListener(event, listeners[i].fn, void 0, true)
        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context)
            break
          case 2:
            listeners[i].fn.call(listeners[i].context, a1)
            break
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2)
            break
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3)
            break
          default:
            if (!args)
              for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j]
              }
            listeners[i].fn.apply(listeners[i].context, args)
        }
      }
    }
    return true
  }
  EventEmitter2.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false)
  }
  EventEmitter2.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true)
  }
  EventEmitter2.prototype.removeListener = function removeListener(
    event,
    fn,
    context,
    once
  ) {
    var evt = prefix ? prefix + event : event
    if (!this._events[evt]) return this
    if (!fn) {
      clearEvent(this, evt)
      return this
    }
    var listeners = this._events[evt]
    if (listeners.fn) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        clearEvent(this, evt)
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (
          listeners[i].fn !== fn ||
          (once && !listeners[i].once) ||
          (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i])
        }
      }
      if (events.length)
        this._events[evt] = events.length === 1 ? events[0] : events
      else clearEvent(this, evt)
    }
    return this
  }
  EventEmitter2.prototype.removeAllListeners = function removeAllListeners(
    event
  ) {
    var evt
    if (event) {
      evt = prefix ? prefix + event : event
      if (this._events[evt]) clearEvent(this, evt)
    } else {
      this._events = new Events()
      this._eventsCount = 0
    }
    return this
  }
  EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener
  EventEmitter2.prototype.addListener = EventEmitter2.prototype.on
  EventEmitter2.prefixed = prefix
  EventEmitter2.EventEmitter = EventEmitter2
  {
    module.exports = EventEmitter2
  }
})(eventemitter3)
var EventEmitter = eventemitter3.exports
const createCanvas = (
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
  let ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  if (!opt.noTranslate) {
    ctx.translate(canvas.width / 2, canvas.height / 2)
  }
  return {
    canvas,
    ctx
  }
}
const getTowPointDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}
const getPointToLineDistance = (x, y, x1, y1, x2, y2) => {
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
const checkIsAtSegment = (x, y, x1, y1, x2, y2, dis = 10) => {
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
const radToDeg = rad => {
  return rad * (180 / Math.PI)
}
const degToRad = deg => {
  return deg * (Math.PI / 180)
}
const getTowPointRotate = (cx, cy, tx, ty, fx, fy) => {
  return radToDeg(Math.atan2(ty - cy, tx - cx) - Math.atan2(fy - cy, fx - cx))
}
const getRotatedPoint = (x, y, cx, cy, rotate) => {
  let deg = radToDeg(Math.atan2(y - cy, x - cx))
  let del = deg + rotate
  let dis = getTowPointDistance(x, y, cx, cy)
  return {
    x: Math.cos(degToRad(del)) * dis + cx,
    y: Math.sin(degToRad(del)) * dis + cy
  }
}
const getElementCenterPoint = element => {
  let { x, y, width, height } = element
  return {
    x: x + width / 2,
    y: y + height / 2
  }
}
const transformPointReverseRotate = (x, y, cx, cy, rotate) => {
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
const transformPointOnElement = (x, y, element) => {
  let center = getElementCenterPoint(element)
  return transformPointReverseRotate(x, y, center.x, center.y, element.rotate)
}
const getElementCornerPoint = (element, dir) => {
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
  }
}
const getElementRotatedCornerPoint = (element, dir) => {
  let center = getElementCenterPoint(element)
  let dirPos = getElementCornerPoint(element, dir)
  return getRotatedPoint(dirPos.x, dirPos.y, center.x, center.y, element.rotate)
}
const checkPointIsInRectangle = (x, y, rx, ry, rw, rh) => {
  if (typeof rx === 'object') {
    let element = rx
    rx = element.x
    ry = element.y
    rw = element.width
    rh = element.height
  }
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh
}
const getBoundingRect = (pointArr = [], returnCorners = false) => {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  pointArr.forEach(point => {
    let [x2, y2] = point
    if (x2 < minX) {
      minX = x2
    }
    if (x2 > maxX) {
      maxX = x2
    }
    if (y2 < minY) {
      minY = y2
    }
    if (y2 > maxY) {
      maxY = y2
    }
  })
  let x = minX
  let y = minY
  let width = maxX - minX
  let height = maxY - minY
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
const deepCopy = obj => {
  return JSON.parse(JSON.stringify(obj))
}
const getFontString = (fontSize, fontFamily) => {
  return `${fontSize}px ${fontFamily}`
}
const splitTextLines = text => {
  return text.replace(/\r\n?/g, '\n').split('\n')
}
let textCheckEl = null
const getTextActWidth = (text, style) => {
  if (!textCheckEl) {
    textCheckEl = document.createElement('div')
    textCheckEl.style.position = 'fixed'
    textCheckEl.style.left = '-99999px'
    document.body.appendChild(textCheckEl)
  }
  let { fontSize, fontFamily } = style
  textCheckEl.innerText = text
  textCheckEl.style.fontSize = fontSize + 'px'
  textCheckEl.style.fontFamily = fontFamily
  let { width } = textCheckEl.getBoundingClientRect()
  return width
}
const getMaxFontSizeInWidth = (text, width, style) => {
  let fontSize = 12
  while (
    getTextActWidth(
      text,
      __spreadProps(__spreadValues({}, style), {
        fontSize: fontSize + 1
      })
    ) < width
  ) {
    fontSize++
  }
  return fontSize
}
const getWrapTextActWidth = element => {
  let { text } = element
  let textArr = splitTextLines(text)
  let maxWidth = -Infinity
  textArr.forEach(textRow => {
    let width = getTextActWidth(textRow, element.style)
    if (width > maxWidth) {
      maxWidth = width
    }
  })
  return maxWidth
}
const getWrapTextMaxRowTextNumber = text => {
  let textArr = splitTextLines(text)
  let maxNumber = -Infinity
  textArr.forEach(textRow => {
    if (textRow.length > maxNumber) {
      maxNumber = textRow.length
    }
  })
  return maxNumber
}
const getTextElementSize = element => {
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
const throttle = (fn, ctx, time = 100) => {
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
const computedLineWidthBySpeed = (speed, lastLineWidth, baseLineWidth = 2) => {
  let lineWidth = 0
  let maxLineWidth = baseLineWidth
  let maxSpeed = 10
  let minSpeed = 0.5
  if (speed >= maxSpeed) {
    lineWidth = baseLineWidth
  } else if (speed <= minSpeed) {
    lineWidth = maxLineWidth + 1
  } else {
    lineWidth =
      maxLineWidth - ((speed - minSpeed) / (maxSpeed - minSpeed)) * maxLineWidth
  }
  if (lastLineWidth === -1) {
    lastLineWidth = maxLineWidth
  }
  return lineWidth * (1 / 2) + lastLineWidth * (1 / 2)
}
const downloadFile = (file, fileName) => {
  let a = document.createElement('a')
  a.href = file
  a.download = fileName
  a.click()
}
const getElementCorners = element => {
  let topLeft = getElementRotatedCornerPoint(element, 'topLeft')
  let topRight = getElementRotatedCornerPoint(element, 'topRight')
  let bottomLeft = getElementRotatedCornerPoint(element, 'bottomLeft')
  let bottomRight = getElementRotatedCornerPoint(element, 'bottomRight')
  return [topLeft, topRight, bottomLeft, bottomRight]
}
const getMultiElementRectInfo = (elementList = []) => {
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
const createImageObj = url => {
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
let nodeKeyIndex = 0
const createNodeKey = () => {
  return nodeKeyIndex++
}
var utils = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ Object.defineProperty(
    {
      __proto__: null,
      createCanvas,
      getTowPointDistance,
      getPointToLineDistance,
      checkIsAtSegment,
      radToDeg,
      degToRad,
      getTowPointRotate,
      getRotatedPoint,
      getElementCenterPoint,
      transformPointReverseRotate,
      transformPointOnElement,
      getElementCornerPoint,
      getElementRotatedCornerPoint,
      checkPointIsInRectangle,
      getBoundingRect,
      deepCopy,
      getFontString,
      splitTextLines,
      getTextActWidth,
      getMaxFontSizeInWidth,
      getWrapTextActWidth,
      getWrapTextMaxRowTextNumber,
      getTextElementSize,
      throttle,
      computedLineWidthBySpeed,
      downloadFile,
      getElementCorners,
      getMultiElementRectInfo,
      createImageObj,
      createNodeKey
    },
    Symbol.toStringTag,
    { value: 'Module' }
  )
)
const CORNERS = {
  TOP_LEFT: 'topLeft',
  TOP_RIGHT: 'topRight',
  BOTTOM_RIGHT: 'bottomRight',
  BOTTOM_LEFT: 'bottomLeft'
}
const DRAG_ELEMENT_PARTS = {
  BODY: 'body',
  ROTATE: 'rotate',
  TOP_LEFT_BTN: 'topLeftBtn',
  TOP_RIGHT_BTN: 'topRightBtn',
  BOTTOM_RIGHT_BTN: 'bottomRightBtn',
  BOTTOM_LEFT_BTN: 'bottomLeftBtn'
}
const HIT_DISTANCE = 10
const checkIsAtMultiSegment = (segments, rp) => {
  let res = false
  segments.forEach(seg => {
    if (res) return
    if (checkIsAtSegment(rp.x, rp.y, ...seg, HIT_DISTANCE)) {
      res = true
    }
  })
  return res
}
const checkIsAtRectangleEdge = (element, rp) => {
  let { x, y, width, height } = element
  let segments = [
    [x, y, x + width, y],
    [x + width, y, x + width, y + height],
    [x + width, y + height, x, y + height],
    [x, y + height, x, y]
  ]
  return checkIsAtMultiSegment(segments, rp) ? element : null
}
const checkIsAtRectangleInner = (element, rp) => {
  return checkPointIsInRectangle(rp.x, rp.y, element) ? element : null
}
const getCircleRadius = (width, height) => {
  return Math.min(Math.abs(width), Math.abs(height)) / 2
}
const checkIsAtCircleEdge = (element, rp) => {
  let { width, height, x, y } = element
  let radius = getCircleRadius(width, height)
  let dis = getTowPointDistance(rp.x, rp.y, x + radius, y + radius)
  let onCircle = dis >= radius - HIT_DISTANCE && dis <= radius + HIT_DISTANCE
  return onCircle ? element : null
}
const checkIsAtLineEdge = (element, rp) => {
  let segments = []
  let len = element.pointArr.length
  let arr = element.pointArr
  for (let i = 0; i < len - 1; i++) {
    segments.push([...arr[i], ...arr[i + 1]])
  }
  return checkIsAtMultiSegment(segments, rp) ? element : null
}
const checkIsAtFreedrawLineEdge = (element, rp) => {
  let res = null
  element.pointArr.forEach(point => {
    if (res) return
    let dis = getTowPointDistance(rp.x, rp.y, point[0], point[1])
    if (dis <= HIT_DISTANCE) {
      res = element
    }
  })
  return res
}
const checkIsAtDiamondEdge = (element, rp) => {
  let { x, y, width, height } = element
  let segments = [
    [x + width / 2, y, x + width, y + height / 2],
    [x + width, y + height / 2, x + width / 2, y + height],
    [x + width / 2, y + height, x, y + height / 2],
    [x, y + height / 2, x + width / 2, y]
  ]
  return checkIsAtMultiSegment(segments, rp) ? element : null
}
const checkIsAtTriangleEdge = (element, rp) => {
  let { x, y, width, height } = element
  let segments = [
    [x + width / 2, y, x + width, y + height],
    [x + width, y + height, x, y + height],
    [x, y + height, x + width / 2, y]
  ]
  return checkIsAtMultiSegment(segments, rp) ? element : null
}
const checkIsAtArrowEdge = (element, rp) => {
  let pointArr = element.pointArr
  let x = pointArr[0][0]
  let y = pointArr[0][1]
  let tx = pointArr[pointArr.length - 1][0]
  let ty = pointArr[pointArr.length - 1][1]
  let segments = [[x, y, tx, ty]]
  return checkIsAtMultiSegment(segments, rp) ? element : null
}
var checkHit = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ Object.defineProperty(
    {
      __proto__: null,
      checkIsAtMultiSegment,
      checkIsAtRectangleEdge,
      checkIsAtRectangleInner,
      getCircleRadius,
      checkIsAtCircleEdge,
      checkIsAtLineEdge,
      checkIsAtFreedrawLineEdge,
      checkIsAtDiamondEdge,
      checkIsAtTriangleEdge,
      checkIsAtArrowEdge
    },
    Symbol.toStringTag,
    { value: 'Module' }
  )
)
const drawWrap = (ctx, fn, fill = false) => {
  ctx.beginPath()
  fn()
  ctx.stroke()
  if (fill) {
    ctx.fill()
  }
}
const drawRect = (ctx, x, y, width, height, fill = false) => {
  drawWrap(ctx, () => {
    ctx.rect(x, y, width, height)
    if (fill) {
      ctx.fillRect(x, y, width, height)
    }
  })
}
const drawDiamond = (ctx, x, y, width, height, fill = false) => {
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
const drawTriangle = (ctx, x, y, width, height, fill = false) => {
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
const drawCircle = (ctx, x, y, r, fill = false) => {
  drawWrap(
    ctx,
    () => {
      ctx.arc(x, y, r, 0, 2 * Math.PI)
    },
    fill
  )
}
const drawLine = (ctx, points) => {
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
const drawArrow = (ctx, pointArr) => {
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
const transformFreeLinePoint = (point, opt) => {
  let { x, y } = opt.app.coordinate.transform(point[0], point[1])
  return [x - opt.cx, y - opt.cy, ...point.slice(2)]
}
const drawFreeLine = (ctx, points, opt) => {
  for (let i = 0; i < points.length - 1; i++) {
    drawWrap(
      ctx,
      () => {
        let point = transformFreeLinePoint(points[i], opt)
        let nextPoint = transformFreeLinePoint(points[i + 1], opt)
        drawLineSegment(
          ctx,
          point[0],
          point[1],
          nextPoint[0],
          nextPoint[1],
          nextPoint[2]
        )
      },
      true
    )
  }
}
const drawLineSegment = (ctx, mx, my, tx, ty, lineWidth = 0) => {
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
const drawText = (ctx, textObj, x, y, width, height) => {
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
const drawImage = (ctx, element, x, y, width, height) => {
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
var draw = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ Object.defineProperty(
    {
      __proto__: null,
      drawWrap,
      drawRect,
      drawDiamond,
      drawTriangle,
      drawCircle,
      drawLine,
      drawArrow,
      drawFreeLine,
      drawLineSegment,
      drawText,
      drawImage
    },
    Symbol.toStringTag,
    { value: 'Module' }
  )
)
class Coordinate {
  constructor(app) {
    this.app = app
  }
  addScrollY(y) {
    return y + this.app.state.scrollY
  }
  addScrollX(x) {
    return x + this.app.state.scrollX
  }
  subScrollY(y) {
    return y - this.app.state.scrollY
  }
  subScrollX(x) {
    return x - this.app.state.scrollX
  }
  transformToCanvasCoordinate(x, y) {
    x -= this.app.width / 2
    y -= this.app.height / 2
    return {
      x,
      y
    }
  }
  transformToScreenCoordinate(x, y) {
    x += this.app.width / 2
    y += this.app.height / 2
    return {
      x,
      y
    }
  }
  transform(x, y) {
    let t = this.transformToCanvasCoordinate(x, y)
    return {
      x: this.subScrollX(t.x),
      y: this.subScrollY(t.y)
    }
  }
  windowToContainer(x, y) {
    return {
      x: x - this.app.left,
      y: y - this.app.top
    }
  }
  containerToWindow(x, y) {
    return {
      x: x + this.app.left,
      y: y + this.app.top
    }
  }
  scale(x, y) {
    let { state } = this.app
    let wp = this.transformToCanvasCoordinate(x, y)
    let sp = this.transformToScreenCoordinate(
      wp.x * state.scale,
      wp.y * state.scale
    )
    return {
      x: sp.x,
      y: sp.y
    }
  }
  reverseScale(x, y) {
    let { state } = this.app
    let tp = this.transformToCanvasCoordinate(x, y)
    let sp = this.transformToScreenCoordinate(
      tp.x / state.scale,
      tp.y / state.scale
    )
    return {
      x: sp.x,
      y: sp.y
    }
  }
  gridAdsorbent(x, y) {
    let { gridConfig, showGrid } = this.app.state
    if (!showGrid) {
      return {
        x,
        y
      }
    }
    let gridSize = gridConfig.size
    return {
      x: x - (x % gridSize),
      y: y - (y % gridSize)
    }
  }
}
class Event extends EventEmitter {
  constructor(app) {
    super()
    this.app = app
    this.coordinate = app.coordinate
    this.isMousedown = false
    this.mousedownPos = {
      x: 0,
      y: 0,
      unGridClientX: 0,
      unGridClientY: 0,
      originClientX: 0,
      originClientY: 0
    }
    this.mouseOffset = {
      x: 0,
      y: 0,
      originX: 0,
      originY: 0
    }
    this.lastMousePos = {
      x: 0,
      y: 0
    }
    this.mouseDistance = 0
    this.lastMouseTime = Date.now()
    this.mouseDuration = 0
    this.mouseSpeed = 0
    this.onMousedown = this.onMousedown.bind(this)
    this.onMousemove = this.onMousemove.bind(this)
    this.onMouseup = this.onMouseup.bind(this)
    this.onDblclick = this.onDblclick.bind(this)
    this.onMousewheel = this.onMousewheel.bind(this)
    this.onKeydown = this.onKeydown.bind(this)
    this.onKeyup = this.onKeyup.bind(this)
    this.onContextmenu = this.onContextmenu.bind(this)
    this.bindEvent()
  }
  bindEvent() {
    this.app.container.addEventListener('mousedown', this.onMousedown)
    this.app.container.addEventListener('mousemove', this.onMousemove)
    this.app.container.addEventListener('mouseup', this.onMouseup)
    this.app.container.addEventListener('dblclick', this.onDblclick)
    this.app.container.addEventListener('mousewheel', this.onMousewheel)
    this.app.container.addEventListener('contextmenu', this.onContextmenu)
    window.addEventListener('keydown', this.onKeydown)
    window.addEventListener('keyup', this.onKeyup)
  }
  unbindEvent() {
    this.app.container.removeEventListener('mousedown', this.onMousedown)
    this.app.container.removeEventListener('mousemove', this.onMousemove)
    this.app.container.removeEventListener('mouseup', this.onMouseup)
    this.app.container.removeEventListener('dblclick', this.onDblclick)
    this.app.container.removeEventListener('mousewheel', this.onMousewheel)
    this.app.container.removeEventListener('contextmenu', this.onContextmenu)
    window.removeEventListener('keydown', this.onKeydown)
    window.removeEventListener('keyup', this.onKeyup)
  }
  transformEvent(e) {
    let { coordinate } = this.app
    let wp = coordinate.windowToContainer(e.clientX, e.clientY)
    let { x, y } = coordinate.reverseScale(wp.x, wp.y)
    x = coordinate.addScrollX(x)
    y = coordinate.addScrollY(y)
    let unGridClientX = x
    let unGridClientY = y
    let gp = coordinate.gridAdsorbent(x, y)
    let newEvent = {
      originEvent: e,
      unGridClientX,
      unGridClientY,
      clientX: gp.x,
      clientY: gp.y
    }
    return newEvent
  }
  onMousedown(e) {
    e = this.transformEvent(e)
    this.isMousedown = true
    this.mousedownPos.x = e.clientX
    this.mousedownPos.y = e.clientY
    this.mousedownPos.unGridClientX = e.unGridClientX
    this.mousedownPos.unGridClientY = e.unGridClientY
    this.mousedownPos.originClientX = e.originEvent.clientX
    this.mousedownPos.originClientY = e.originEvent.clientY
    this.emit('mousedown', e, this)
  }
  onMousemove(e) {
    e = this.transformEvent(e)
    let x = e.clientX
    let y = e.clientY
    if (this.isMousedown) {
      this.mouseOffset.x = x - this.mousedownPos.x
      this.mouseOffset.y = y - this.mousedownPos.y
      this.mouseOffset.originX =
        e.originEvent.clientX - this.mousedownPos.originClientX
      this.mouseOffset.originY =
        e.originEvent.clientY - this.mousedownPos.originClientY
    }
    let curTime = Date.now()
    this.mouseDuration = curTime - this.lastMouseTime
    this.mouseDistance = getTowPointDistance(
      x,
      y,
      this.lastMousePos.x,
      this.lastMousePos.y
    )
    this.mouseSpeed = this.mouseDistance / this.mouseDuration
    this.emit('mousemove', e, this)
    this.lastMouseTime = curTime
    this.lastMousePos.x = x
    this.lastMousePos.y = y
  }
  onMouseup(e) {
    e = this.transformEvent(e)
    this.isMousedown = false
    this.mousedownPos.x = 0
    this.mousedownPos.y = 0
    this.emit('mouseup', e, this)
  }
  onDblclick(e) {
    e = this.transformEvent(e)
    this.emit('dblclick', e, this)
  }
  onMousewheel(e) {
    e = this.transformEvent(e)
    this.emit('mousewheel', e.originEvent.wheelDelta < 0 ? 'down' : 'up')
  }
  onContextmenu(e) {
    e.stopPropagation()
    e.preventDefault()
    e = this.transformEvent(e)
    this.emit('contextmenu', e, this)
  }
  onKeydown(e) {
    this.emit('keydown', e, this)
  }
  onKeyup(e) {
    this.emit('keyup', e, this)
  }
}
class BaseElement extends EventEmitter {
  constructor(opts = {}, app) {
    super()
    this.app = app
    this.groupId = opts.groupId || ''
    this.type = opts.type || ''
    this.key = createNodeKey()
    this.isCreating = true
    this.isActive = true
    this.isSelected = false
    this.startX = 0
    this.startY = 0
    this.x = opts.x || 0
    this.y = opts.y || 0
    this.width = opts.width || 0
    this.height = opts.height || 0
    this.startRotate = 0
    this.rotate = opts.rotate || 0
    this.noRender = false
    this.style = __spreadValues(
      {
        strokeStyle: '#000000',
        fillStyle: 'transparent',
        lineWidth: 'small',
        lineDash: 0,
        globalAlpha: 1
      },
      opts.style || {}
    )
    this.dragElement = null
  }
  serialize() {
    return {
      groupId: this.groupId,
      type: this.type,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      rotate: this.rotate,
      style: __spreadValues({}, this.style)
    }
  }
  render() {
    throw new Error(
      '\u5B50\u7C7B\u9700\u8981\u5B9E\u73B0\u8BE5\u65B9\u6CD5\uFF01'
    )
  }
  setGroupId(groupId) {
    this.groupId = groupId
  }
  getGroupId() {
    return this.groupId
  }
  removeGroupId() {
    this.groupId = ''
  }
  hasGroup() {
    return !!this.groupId
  }
  renderDragElement() {
    if (this.isActive && !this.isCreating) {
      this.dragElement.showAll()
      this.dragElement.render()
    } else if (this.isSelected) {
      this.dragElement.onlyShowBody()
      this.dragElement.render()
    }
  }
  handleStyle(style) {
    Object.keys(style).forEach(key => {
      if (key === 'lineWidth') {
        if (style[key] === 'small') {
          style[key] = 2
        } else if (style[key] === 'middle') {
          style[key] = 4
        } else if (style[key] === 'large') {
          style[key] = 6
        }
      }
    })
    return style
  }
  setStyle(style = {}) {
    let _style = this.handleStyle(style)
    Object.keys(_style).forEach(key => {
      if (key === 'lineDash') {
        if (_style.lineDash > 0) {
          this.app.ctx.setLineDash([_style.lineDash])
        }
      } else if (
        _style[key] !== void 0 &&
        _style[key] !== '' &&
        _style[key] !== null
      ) {
        this.app.ctx[key] = _style[key]
      }
    })
    return this
  }
  warpRender(renderFn) {
    let { x, y, width, height, rotate, style } = this
    let { x: tx, y: ty } = this.app.coordinate.transform(x, y)
    let halfWidth = width / 2
    let halfHeight = height / 2
    let cx = tx + halfWidth
    let cy = ty + halfHeight
    this.app.ctx.save()
    this.app.ctx.translate(cx, cy)
    this.app.ctx.rotate(degToRad(rotate))
    this.setStyle(style)
    renderFn({
      halfWidth,
      halfHeight,
      tx,
      ty,
      cx,
      cy
    })
    this.app.ctx.restore()
    return this
  }
  saveState() {
    let { rotate, x, y } = this
    this.startRotate = rotate
    this.startX = x
    this.startY = y
    return this
  }
  move(ox, oy) {
    let { startX, startY } = this
    this.x = startX + ox
    this.y = startY + oy
    this.emit('elementPositionChange', this.x, this.y)
    return this
  }
  updateRect(x, y, width, height) {
    this.updatePos(x, y)
    this.updateSize(width, height)
    return this
  }
  updateSize(width, height) {
    this.width = width
    this.height = height
    this.emit('elementSizeChange', this.width, this.height)
    return this
  }
  updatePos(x, y) {
    this.x = x
    this.y = y
    this.emit('elementPositionChange', this.x, this.y)
    return this
  }
  offsetRotate(or) {
    this.updateRotate(this.startRotate + or)
    return this
  }
  updateRotate(rotate) {
    rotate = rotate % 360
    if (rotate < 0) {
      rotate = 360 + rotate
    }
    this.rotate = parseInt(rotate)
    this.emit('elementRotateChange', this.rotate)
  }
  rotateByCenter(rotate, cx, cy) {
    this.offsetRotate(rotate)
    let np = getRotatedPoint(this.startX, this.startY, cx, cy, rotate)
    this.updatePos(np.x, np.y)
  }
  isHit(x, y) {
    throw new Error('\u5B50\u7C7B\u9700\u8981\u5B9E\u73B0\u8BE5\u65B9\u6CD5!')
  }
  startResize(resizeType, e) {
    this.dragElement.startResize(resizeType, e)
    return this
  }
  endResize() {
    this.dragElement.endResize()
    return this
  }
  resize(...args) {
    this.dragElement.handleResizeElement(...args)
    return this
  }
  getEndpointList() {
    return getElementCorners(this)
  }
}
class DragElement extends BaseElement {
  constructor(element, app, opts = {}) {
    super(
      {
        type: 'dragElement',
        notNeedDragElement: true
      },
      app
    )
    this.opts = __spreadValues(
      {
        lockRatio: false
      },
      opts
    )
    this.style = {
      strokeStyle: '#666',
      fillStyle: 'transparent',
      lineWidth: 'small',
      lineDash: 0,
      globalAlpha: 1
    }
    this.element = element
    this.offset = 5
    this.size = 10
    this.resizeType = ''
    this.diagonalPoint = {
      x: 0,
      y: 0
    }
    this.mousedownPosAndElementPosOffset = {
      x: 0,
      y: 0
    }
    this.elementRatio = 0
    this.hideParts = []
  }
  setHideParts(parts = []) {
    this.hideParts = parts
  }
  showAll() {
    this.setHideParts([])
  }
  onlyShowBody() {
    this.setHideParts([
      DRAG_ELEMENT_PARTS.ROTATE,
      DRAG_ELEMENT_PARTS.TOP_LEFT_BTN,
      DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN,
      DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN,
      DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN
    ])
  }
  update() {
    this.x = this.element.x - this.offset
    this.y = this.element.y - this.offset
    this.width = this.element.width + this.offset * 2
    this.height = this.element.height + this.offset * 2
    this.rotate = this.element.rotate
  }
  render() {
    if (this.element.hasGroup()) return
    this.update()
    let { width, height } = this
    this.warpRender(({ halfWidth, halfHeight }) => {
      this.app.ctx.save()
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.BODY)) {
        this.app.ctx.setLineDash([5])
        drawRect(this.app.ctx, -halfWidth, -halfHeight, width, height)
        this.app.ctx.restore()
      }
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.TOP_LEFT_BTN)) {
        drawRect(
          this.app.ctx,
          -halfWidth - this.size,
          -halfHeight - this.size,
          this.size,
          this.size
        )
      }
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN)) {
        drawRect(
          this.app.ctx,
          -halfWidth + this.element.width + this.size,
          -halfHeight - this.size,
          this.size,
          this.size
        )
      }
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN)) {
        drawRect(
          this.app.ctx,
          -halfWidth + this.element.width + this.size,
          -halfHeight + this.element.height + this.size,
          this.size,
          this.size
        )
      }
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN)) {
        drawRect(
          this.app.ctx,
          -halfWidth - this.size,
          -halfHeight + this.element.height + this.size,
          this.size,
          this.size
        )
      }
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.ROTATE)) {
        drawCircle(
          this.app.ctx,
          -halfWidth + this.element.width / 2 + this.size / 2,
          -halfHeight - this.size * 2,
          this.size
        )
      }
    })
  }
  checkPointInDragElementWhere(x, y) {
    let part = ''
    let rp = transformPointOnElement(x, y, this.element)
    if (checkPointIsInRectangle(rp.x, rp.y, this)) {
      part = DRAG_ELEMENT_PARTS.BODY
    } else if (
      getTowPointDistance(
        rp.x,
        rp.y,
        this.x + this.width / 2,
        this.y - this.size * 2
      ) <= this.size
    ) {
      part = DRAG_ELEMENT_PARTS.ROTATE
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.TOP_LEFT)) {
      part = DRAG_ELEMENT_PARTS.TOP_LEFT_BTN
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.TOP_RIGHT)) {
      part = DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.BOTTOM_RIGHT)) {
      part = DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.BOTTOM_LEFT)) {
      part = DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN
    }
    if (this.hideParts.includes(part)) {
      part = ''
    }
    return part
  }
  _checkPointIsInBtn(x, y, dir) {
    let _x = 0
    let _y = 0
    switch (dir) {
      case CORNERS.TOP_LEFT:
        _x = this.x - this.size
        _y = this.y - this.size
        break
      case CORNERS.TOP_RIGHT:
        _x = this.x + this.width
        _y = this.y - this.size
        break
      case CORNERS.BOTTOM_RIGHT:
        _x = this.x + this.width
        _y = this.y + this.height
        break
      case CORNERS.BOTTOM_LEFT:
        _x = this.x - this.size
        _y = this.y + this.height
        break
    }
    return checkPointIsInRectangle(x, y, _x, _y, this.size, this.size)
  }
  startResize(resizeType, e) {
    this.resizeType = resizeType
    if (this.opts.lockRatio) {
      this.elementRatio = this.element.width / this.element.height
    }
    if (resizeType === DRAG_ELEMENT_PARTS.BODY) {
      this.element.saveState()
    } else if (resizeType === DRAG_ELEMENT_PARTS.ROTATE) {
      this.element.saveState()
    } else if (resizeType === DRAG_ELEMENT_PARTS.TOP_LEFT_BTN) {
      this.handleDragMousedown(e, CORNERS.TOP_LEFT)
    } else if (resizeType === DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN) {
      this.handleDragMousedown(e, CORNERS.TOP_RIGHT)
    } else if (resizeType === DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN) {
      this.handleDragMousedown(e, CORNERS.BOTTOM_RIGHT)
    } else if (resizeType === DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN) {
      this.handleDragMousedown(e, CORNERS.BOTTOM_LEFT)
    }
  }
  endResize() {
    this.resizeType = ''
    this.diagonalPoint = {
      x: 0,
      y: 0
    }
    this.mousedownPosAndElementPosOffset = {
      x: 0,
      y: 0
    }
    this.elementRatio = 0
  }
  handleDragMousedown(e, corner) {
    let centerPos = getElementCenterPoint(this.element)
    let pos = getElementRotatedCornerPoint(this.element, corner)
    this.diagonalPoint.x = 2 * centerPos.x - pos.x
    this.diagonalPoint.y = 2 * centerPos.y - pos.y
    this.mousedownPosAndElementPosOffset.x = e.clientX - pos.x
    this.mousedownPosAndElementPosOffset.y = e.clientY - pos.y
    this.element.saveState()
  }
  handleResizeElement(e, mx, my, offsetX, offsetY) {
    let resizeType = this.resizeType
    if (resizeType === DRAG_ELEMENT_PARTS.BODY) {
      this.handleMoveElement(offsetX, offsetY)
    } else if (resizeType === DRAG_ELEMENT_PARTS.ROTATE) {
      this.handleRotateElement(e, mx, my)
    } else if (resizeType === DRAG_ELEMENT_PARTS.TOP_LEFT_BTN) {
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (newCenter.x - rp.x) * 2,
            height: (newCenter.y - rp.y) * 2
          }
        },
        rp => {
          return {
            x: rp.x,
            y: rp.y
          }
        },
        (newRatio, newRect) => {
          let x = newRect.x
          let y = newRect.y
          if (newRatio > this.elementRatio) {
            x = newRect.x + newRect.width - this.elementRatio * newRect.height
          } else if (newRatio < this.elementRatio) {
            y = newRect.y + (newRect.height - newRect.width / this.elementRatio)
          }
          return {
            x,
            y
          }
        }
      )
    } else if (resizeType === DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN) {
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (rp.x - newCenter.x) * 2,
            height: (newCenter.y - rp.y) * 2
          }
        },
        (rp, newSize) => {
          return {
            x: rp.x - newSize.width,
            y: rp.y
          }
        },
        (newRatio, newRect) => {
          let x = newRect.x
          let y = newRect.y
          if (newRatio > this.elementRatio) {
            x = newRect.x + this.elementRatio * newRect.height
          } else if (newRatio < this.elementRatio) {
            x = newRect.x + newRect.width
            y = newRect.y + (newRect.height - newRect.width / this.elementRatio)
          }
          return {
            x,
            y
          }
        }
      )
    } else if (resizeType === DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN) {
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (rp.x - newCenter.x) * 2,
            height: (rp.y - newCenter.y) * 2
          }
        },
        (rp, newSize) => {
          return {
            x: rp.x - newSize.width,
            y: rp.y - newSize.height
          }
        },
        (newRatio, newRect) => {
          let x = newRect.x
          let y = newRect.y
          if (newRatio > this.elementRatio) {
            x = newRect.x + this.elementRatio * newRect.height
            y = newRect.y + newRect.height
          } else if (newRatio < this.elementRatio) {
            x = newRect.x + newRect.width
            y = newRect.y + newRect.width / this.elementRatio
          }
          return {
            x,
            y
          }
        }
      )
    } else if (resizeType === DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN) {
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (newCenter.x - rp.x) * 2,
            height: (rp.y - newCenter.y) * 2
          }
        },
        (rp, newSize) => {
          return {
            x: rp.x,
            y: rp.y - newSize.height
          }
        },
        (newRatio, newRect) => {
          let x = newRect.x
          let y = newRect.y
          if (newRatio > this.elementRatio) {
            x = newRect.x + newRect.width - this.elementRatio * newRect.height
            y = newRect.y + newRect.height
          } else if (newRatio < this.elementRatio) {
            y = newRect.y + newRect.width / this.elementRatio
          }
          return {
            x,
            y
          }
        }
      )
    }
  }
  handleMoveElement(offsetX, offsetY) {
    this.element.move(offsetX, offsetY)
  }
  handleRotateElement(e, mx, my) {
    let centerPos = getElementCenterPoint(this.element)
    let rotate = getTowPointRotate(
      centerPos.x,
      centerPos.y,
      e.clientX,
      e.clientY,
      mx,
      my
    )
    this.element.offsetRotate(rotate)
  }
  stretchCalc(x, y, calcSize, calcPos) {
    let newCenter = {
      x: (x + this.diagonalPoint.x) / 2,
      y: (y + this.diagonalPoint.y) / 2
    }
    let rp = transformPointReverseRotate(
      x,
      y,
      newCenter.x,
      newCenter.y,
      this.element.rotate
    )
    let newSize = calcSize(newCenter, rp)
    let isWidthReverse = false
    if (newSize.width < 0) {
      newSize.width = 0
      isWidthReverse = true
    }
    let isHeightReverse = false
    if (newSize.height < 0) {
      newSize.height = 0
      isHeightReverse = true
    }
    let newPos = calcPos(rp, newSize)
    let newRect = {
      x: newPos.x,
      y: newPos.y,
      width: newSize.width,
      height: newSize.height
    }
    if (isWidthReverse || isHeightReverse) {
      newRect.x = this.element.x
      newRect.y = this.element.y
    }
    return {
      newRect,
      newCenter
    }
  }
  handleStretchElement(e, calcSize, calcPos, fixPos) {
    let actClientX = e.clientX - this.mousedownPosAndElementPosOffset.x
    let actClientY = e.clientY - this.mousedownPosAndElementPosOffset.y
    let { newRect, newCenter } = this.stretchCalc(
      actClientX,
      actClientY,
      calcSize,
      calcPos
    )
    if (this.opts.lockRatio) {
      this.fixStretch(newRect, newCenter, calcSize, calcPos, fixPos)
      return
    }
    this.element.updateRect(newRect.x, newRect.y, newRect.width, newRect.height)
  }
  fixStretch(newRect, newCenter, calcSize, calcPos, fixPos) {
    let newRatio = newRect.width / newRect.height
    let fp = fixPos(newRatio, newRect)
    let rp = getRotatedPoint(
      fp.x,
      fp.y,
      newCenter.x,
      newCenter.y,
      this.element.rotate
    )
    let fixNewRect = this.stretchCalc(rp.x, rp.y, calcSize, calcPos).newRect
    if (fixNewRect.width === 0 && fixNewRect.height === 0) {
      return
    }
    this.element.updateRect(
      fixNewRect.x,
      fixNewRect.y,
      fixNewRect.width,
      fixNewRect.height
    )
  }
}
class Rectangle extends BaseElement {
  constructor(...args) {
    super(...args)
    this.dragElement = new DragElement(this, this.app)
  }
  render() {
    let { width, height } = this
    this.warpRender(({ halfWidth, halfHeight }) => {
      drawRect(this.app.ctx, -halfWidth, -halfHeight, width, height, true)
    })
    this.renderDragElement()
  }
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtRectangleEdge(this, rp)
  }
}
class Circle extends BaseElement {
  constructor(...args) {
    super(...args)
    this.dragElement = new DragElement(this, this.app, {
      lockRatio: true
    })
  }
  render() {
    let { width, height } = this
    this.warpRender(({ halfWidth, halfHeight }) => {
      drawCircle(this.app.ctx, 0, 0, getCircleRadius(width, height), true)
    })
    this.renderDragElement()
  }
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtCircleEdge(this, rp)
  }
}
class Diamond extends BaseElement {
  constructor(...args) {
    super(...args)
    this.dragElement = new DragElement(this, this.app)
  }
  render() {
    let { width, height } = this
    this.warpRender(({ halfWidth, halfHeight }) => {
      drawDiamond(this.app.ctx, -halfWidth, -halfHeight, width, height, true)
    })
    this.renderDragElement()
  }
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtDiamondEdge(this, rp)
  }
  getEndpointList() {
    let { x, y, width, height, rotate } = this
    let points = [
      [x + width / 2, y],
      [x + width, y + height / 2],
      [x + width / 2, y + height],
      [x, y + height / 2]
    ]
    let center = getElementCenterPoint(this)
    return points.map(point => {
      return getRotatedPoint(point[0], point[1], center.x, center.y, rotate)
    })
  }
}
class Triangle extends BaseElement {
  constructor(...args) {
    super(...args)
    this.dragElement = new DragElement(this, this.app)
  }
  render() {
    let { width, height } = this
    this.warpRender(({ halfWidth, halfHeight }) => {
      drawTriangle(this.app.ctx, -halfWidth, -halfHeight, width, height, true)
    })
    this.renderDragElement()
  }
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtTriangleEdge(this, rp)
  }
  getEndpointList() {
    let { x, y, width, height, rotate } = this
    let points = [
      [x + width / 2, y],
      [x + width, y + height],
      [x, y + height]
    ]
    let center = getElementCenterPoint(this)
    return points.map(point => {
      return getRotatedPoint(point[0], point[1], center.x, center.y, rotate)
    })
  }
}
class BaseMultiPointElement extends BaseElement {
  constructor(opts = {}, app) {
    super(opts, app)
    this.startPointArr = []
    this.pointArr = opts.pointArr || []
    this.startWidth = 0
    this.startHeight = 0
    this.fictitiousPoint = {
      x: 0,
      y: 0
    }
  }
  serialize() {
    let base = super.serialize()
    return __spreadProps(__spreadValues({}, base), {
      pointArr: [...this.pointArr]
    })
  }
  addPoint(x, y, ...args) {
    if (!Array.isArray(this.pointArr)) {
      return
    }
    this.pointArr.push([x, y, ...args])
    return this
  }
  updateMultiPointBoundingRect() {
    let rect = getBoundingRect(this.pointArr)
    this.x = rect.x
    this.y = rect.y
    this.width = rect.width
    this.height = rect.height
    return this
  }
  updateFictitiousPoint(x, y) {
    this.fictitiousPoint.x = x
    this.fictitiousPoint.y = y
  }
  saveState() {
    let { rotate, x, y, width, height, pointArr } = this
    this.startRotate = rotate
    this.startX = x
    this.startY = y
    this.startPointArr = deepCopy(pointArr)
    this.startWidth = width
    this.startHeight = height
    return this
  }
  move(ox, oy) {
    this.pointArr = this.startPointArr.map(point => {
      return [point[0] + ox, point[1] + oy, ...point.slice(2)]
    })
    let { startX, startY } = this
    this.x = startX + ox
    this.y = startY + oy
    return this
  }
  updateRect(x, y, width, height) {
    let { startWidth, startHeight, startPointArr } = this
    let scaleX = width / startWidth
    let scaleY = height / startHeight
    this.pointArr = startPointArr.map(point => {
      let nx = point[0] * scaleX
      let ny = point[1] * scaleY
      return [nx, ny, ...point.slice(2)]
    })
    let rect = getBoundingRect(this.pointArr)
    let offsetX = rect.x - x
    let offsetY = rect.y - y
    this.pointArr = this.pointArr.map(point => {
      return [point[0] - offsetX, point[1] - offsetY, ...point.slice(2)]
    })
    this.updatePos(x, y)
    this.updateSize(width, height)
    return this
  }
  rotateByCenter(rotate, cx, cy) {
    this.pointArr = this.startPointArr.map(point => {
      let np = getRotatedPoint(point[0], point[1], cx, cy, rotate)
      return [np.x, np.y, ...point.slice(2)]
    })
    this.updateMultiPointBoundingRect()
  }
  getEndpointList() {
    return this.pointArr.map(point => {
      let center = getElementCenterPoint(this)
      let np = getRotatedPoint(
        point[0],
        point[1],
        center.x,
        center.y,
        this.rotate
      )
      return {
        x: np.x,
        y: np.y
      }
    })
  }
}
class Freedraw extends BaseMultiPointElement {
  constructor(...args) {
    super(...args)
    this.dragElement = new DragElement(this, this.app)
    this.lastLineWidth = -1
  }
  render() {
    let { pointArr } = this
    this.warpRender(({ cx, cy }) => {
      drawFreeLine(this.app.ctx, pointArr, {
        app: this.app,
        cx,
        cy
      })
    })
    this.renderDragElement()
  }
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtFreedrawLineEdge(this, rp)
  }
  singleRender(mx, my, tx, ty, lineWidth) {
    this.app.ctx.save()
    drawLineSegment(this.app.ctx, mx, my, tx, ty, lineWidth)
    this.app.ctx.restore()
  }
}
class Arrow extends BaseMultiPointElement {
  constructor(...args) {
    super(...args)
    this.dragElement = new DragElement(this, this.app)
  }
  render() {
    let { pointArr, fictitiousPoint } = this
    this.warpRender(({ cx, cy }) => {
      let realtimePoint = []
      if (pointArr.length > 0 && this.isCreating) {
        let { x: fx, y: fy } = this.app.coordinate.transform(
          fictitiousPoint.x - cx,
          fictitiousPoint.y - cy
        )
        realtimePoint = [[fx, fy]]
      }
      drawArrow(
        this.app.ctx,
        pointArr
          .map(point => {
            let { x, y } = this.app.coordinate.transform(point[0], point[1])
            return [x - cx, y - cy]
          })
          .concat(realtimePoint)
      )
    })
    this.renderDragElement()
  }
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtArrowEdge(this, rp)
  }
}
class Image$1 extends BaseElement {
  constructor(opts = {}, app) {
    super(opts, app)
    this.dragElement = new DragElement(this, this.app, {
      lockRatio: true
    })
    this.url = opts.url || ''
    this.imageObj = opts.imageObj || null
    this.ratio = opts.ratio || 1
  }
  serialize() {
    let base = super.serialize()
    return __spreadProps(__spreadValues({}, base), {
      url: this.url,
      ratio: this.ratio
    })
  }
  render() {
    let { width, height } = this
    this.warpRender(({ halfWidth, halfHeight }) => {
      drawImage(this.app.ctx, this, -halfWidth, -halfHeight, width, height)
    })
    this.renderDragElement()
  }
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtRectangleInner(this, rp)
  }
}
class Line extends BaseMultiPointElement {
  constructor(opts = {}, app) {
    super(opts, app)
    this.dragElement = new DragElement(this, this.app)
    this.isSingle = opts.isSingle
  }
  render() {
    let { pointArr, fictitiousPoint } = this
    this.warpRender(({ cx, cy }) => {
      let realtimePoint = []
      if (pointArr.length > 0 && this.isCreating) {
        let { x: fx, y: fy } = this.app.coordinate.transform(
          fictitiousPoint.x - cx,
          fictitiousPoint.y - cy
        )
        realtimePoint = [[fx, fy]]
      }
      drawLine(
        this.app.ctx,
        pointArr
          .map(point => {
            let { x, y } = this.app.coordinate.transform(point[0], point[1])
            return [x - cx, y - cy]
          })
          .concat(realtimePoint)
      )
    })
    this.renderDragElement()
  }
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtLineEdge(this, rp)
  }
}
class Text extends BaseElement {
  constructor(opts = {}, app) {
    var _a, _b, _c, _d
    super(opts, app)
    this.dragElement = new DragElement(this, this.app, {
      lockRatio: true
    })
    this.text = opts.text || ''
    this.style.fillStyle =
      ((_a = opts.style) == null ? void 0 : _a.fillStyle) || '#000'
    this.style.fontSize =
      ((_b = opts.style) == null ? void 0 : _b.fontSize) || 18
    this.style.lineHeightRatio =
      ((_c = opts.style) == null ? void 0 : _c.lineHeightRatio) || 1.5
    this.style.fontFamily =
      ((_d = opts.style) == null ? void 0 : _d.fontFamily) ||
      '\u5FAE\u8F6F\u96C5\u9ED1, Microsoft YaHei'
  }
  serialize() {
    let base = super.serialize()
    return __spreadProps(__spreadValues({}, base), {
      text: this.text
    })
  }
  render() {
    this.warpRender(({ halfWidth, halfHeight }) => {
      drawText(this.app.ctx, this, -halfWidth, -halfHeight)
    })
    this.renderDragElement()
  }
  isHit(x, y) {
    let rp = transformPointOnElement(x, y, this)
    return checkIsAtRectangleInner(this, rp)
  }
  updateRect(x, y, width, height) {
    let { text, style } = this
    let fontSize = Math.floor(
      height / splitTextLines(text).length / style.lineHeightRatio
    )
    this.style.fontSize = fontSize
    super.updateRect(x, y, width, height)
  }
}
class Elements$1 {
  constructor(app) {
    this.app = app
    this.elementList = []
    this.activeElement = null
    this.isCreatingElement = false
    this.isResizing = false
    this.resizingElement = null
    this.handleResize = throttle(this.handleResize, this, 16)
  }
  serialize(stringify = false) {
    let data = this.elementList.map(element => {
      return element.serialize()
    })
    return stringify ? JSON.stringify(data) : data
  }
  getElementsNum() {
    return this.elementList.length
  }
  hasElements() {
    return this.elementList.length > 0
  }
  addElement(element) {
    this.elementList.push(element)
    return this
  }
  unshiftElement(element) {
    this.elementList.unshift(element)
    return this
  }
  insertElement(element, index) {
    this.elementList.splice(index, 0, element)
  }
  deleteElement(element) {
    let index = this.getElementIndex(element)
    if (index !== -1) {
      this.elementList.splice(index, 1)
      if (element.isActive) {
        this.cancelActiveElement(element)
      }
    }
    return this
  }
  deleteAllElements() {
    this.activeElement = null
    this.elementList = []
    this.isCreatingElement = false
    this.isResizing = false
    this.resizingElement = null
    return this
  }
  getElementIndex(element) {
    return this.elementList.findIndex(item => {
      return item === element
    })
  }
  createElementsFromData(data) {
    data.forEach(item => {
      let element = this.pureCreateElement(item)
      element.isActive = false
      element.isCreating = false
      this.addElement(element)
    })
    this.app.group.initIdToElementList(this.elementList)
    return this
  }
  hasActiveElement() {
    return !!this.activeElement
  }
  setActiveElement(element) {
    this.cancelActiveElement()
    this.activeElement = element
    if (element) {
      element.isActive = true
    }
    this.app.emit('activeElementChange', this.activeElement)
    return this
  }
  cancelActiveElement() {
    if (!this.hasActiveElement()) {
      return this
    }
    this.activeElement.isActive = false
    this.activeElement = null
    this.app.emit('activeElementChange', this.activeElement)
    return this
  }
  checkIsHitElement(e) {
    let x = e.unGridClientX
    let y = e.unGridClientY
    for (let i = this.elementList.length - 1; i >= 0; i--) {
      let element = this.elementList[i]
      if (element.isHit(x, y)) {
        return element
      }
    }
    return null
  }
  pureCreateElement(opts = {}) {
    switch (opts.type) {
      case 'rectangle':
        return new Rectangle(opts, this.app)
      case 'diamond':
        return new Diamond(opts, this.app)
      case 'triangle':
        return new Triangle(opts, this.app)
      case 'circle':
        return new Circle(opts, this.app)
      case 'freedraw':
        return new Freedraw(opts, this.app)
      case 'image':
        return new Image$1(opts, this.app)
      case 'arrow':
        return new Arrow(opts, this.app)
      case 'line':
        return new Line(opts, this.app)
      case 'text':
        return new Text(opts, this.app)
      default:
        return null
    }
  }
  createElement(opts = {}, callback = () => {}, ctx = null, notActive) {
    if (this.hasActiveElement() || this.isCreatingElement) {
      return this
    }
    let element = this.pureCreateElement(opts)
    if (!element) {
      return this
    }
    this.addElement(element)
    if (!notActive) {
      this.setActiveElement(element)
    }
    this.isCreatingElement = true
    callback.call(ctx, element)
    return this
  }
  copyElement(element, notActive = false, pos) {
    return new Promise(resolve =>
      __async(this, null, function* () {
        if (!element) {
          return resolve()
        }
        let data = this.app.group.handleCopyElementData(element.serialize())
        if (data.type === 'image') {
          data.imageObj = yield createImageObj(data.url)
        }
        this.createElement(
          data,
          element2 => {
            this.app.group.handleCopyElement(element2)
            element2.startResize(DRAG_ELEMENT_PARTS.BODY)
            let ox = 20
            let oy = 20
            if (pos) {
              ox = pos.x - element2.x - element2.width / 2
              oy = pos.y - element2.y - element2.height / 2
            }
            let gridAdsorbentPos = this.app.coordinate.gridAdsorbent(ox, oy)
            element2.resize(
              null,
              null,
              null,
              gridAdsorbentPos.x,
              gridAdsorbentPos.y
            )
            element2.isCreating = false
            if (notActive) {
              element2.isActive = false
            }
            this.isCreatingElement = false
            resolve(element2)
          },
          this,
          notActive
        )
      })
    )
  }
  creatingRectangleLikeElement(type, x, y, offsetX, offsetY) {
    this.createElement({
      type,
      x,
      y,
      width: offsetX,
      height: offsetY
    })
    this.activeElement.updateSize(offsetX, offsetY)
  }
  creatingCircle(x, y, e) {
    this.createElement({
      type: 'circle',
      x,
      y
    })
    let radius = getTowPointDistance(e.clientX, e.clientY, x, y)
    this.activeElement.updateSize(radius, radius)
  }
  creatingFreedraw(e, event) {
    this.createElement({
      type: 'freedraw'
    })
    let element = this.activeElement
    let lineWidth = computedLineWidthBySpeed(
      event.mouseSpeed,
      element.lastLineWidth
    )
    element.lastLineWidth = lineWidth
    element.addPoint(e.clientX, e.clientY, lineWidth)
    let { coordinate, ctx, state } = this.app
    let tfp = coordinate.transformToCanvasCoordinate(
      coordinate.subScrollX(event.lastMousePos.x),
      coordinate.subScrollY(event.lastMousePos.y)
    )
    let ttp = coordinate.transformToCanvasCoordinate(
      coordinate.subScrollX(e.clientX),
      coordinate.subScrollY(e.clientY)
    )
    ctx.save()
    ctx.scale(state.scale, state.scale)
    element.singleRender(tfp.x, tfp.y, ttp.x, ttp.y, lineWidth)
    ctx.restore()
  }
  creatingImage(e, { width, height, imageObj, url, ratio }) {
    let gp = this.app.coordinate.gridAdsorbent(
      e.unGridClientX - width / 2,
      e.unGridClientY - height / 2
    )
    this.createElement({
      type: 'image',
      x: gp.x,
      y: gp.y,
      url,
      imageObj,
      width,
      height,
      ratio
    })
  }
  editingText(element) {
    if (element.type !== 'text') {
      return
    }
    element.noRender = true
    this.setActiveElement(element)
  }
  completeEditingText() {
    let element = this.activeElement
    if (!element || element.type !== 'text') {
      return
    }
    if (!element.text.trim()) {
      this.deleteElement(element)
      this.setActiveElement(null)
      return
    }
    element.noRender = false
  }
  completeCreateArrow(e) {
    this.activeElement.addPoint(e.clientX, e.clientY)
  }
  creatingArrow(x, y, e) {
    this.createElement(
      {
        type: 'arrow',
        x,
        y
      },
      element => {
        element.addPoint(x, y)
      }
    )
    this.activeElement.updateFictitiousPoint(e.clientX, e.clientY)
  }
  creatingLine(x, y, e, isSingle = false, notCreate = false) {
    if (!notCreate) {
      this.createElement(
        {
          type: 'line',
          x,
          y,
          isSingle
        },
        element2 => {
          element2.addPoint(x, y)
        }
      )
    }
    let element = this.activeElement
    if (element) {
      element.updateFictitiousPoint(e.clientX, e.clientY)
    }
  }
  completeCreateLine(e, completeCallback = () => {}) {
    let element = this.activeElement
    let x = e.clientX
    let y = e.clientY
    if (element && element.isSingle) {
      element.addPoint(x, y)
      completeCallback()
    } else {
      this.createElement({
        type: 'line',
        isSingle: false
      })
      element = this.activeElement
      element.addPoint(x, y)
      element.updateFictitiousPoint(x, y)
    }
  }
  completeCreateElement() {
    this.isCreatingElement = false
    let element = this.activeElement
    if (!element) {
      return this
    }
    if (['freedraw', 'arrow', 'line'].includes(element.type)) {
      element.updateMultiPointBoundingRect()
    }
    element.isCreating = false
    this.app.emitChange()
    return this
  }
  setActiveElementStyle(style = {}) {
    if (!this.hasActiveElement()) {
      return this
    }
    Object.keys(style).forEach(key => {
      this.activeElement.style[key] = style[key]
    })
    return this
  }
  checkInResizeHand(x, y) {
    let element = this.activeElement
    let hand = element.dragElement.checkPointInDragElementWhere(x, y)
    if (hand) {
      return {
        element,
        hand
      }
    }
    return null
  }
  checkIsResize(x, y, e) {
    if (!this.hasActiveElement()) {
      return false
    }
    let res = this.checkInResizeHand(x, y)
    if (res) {
      this.isResizing = true
      this.resizingElement = res.element
      this.resizingElement.startResize(res.hand, e)
      this.app.cursor.setResize(res.hand)
      return true
    }
    return false
  }
  handleResize(...args) {
    if (!this.isResizing) {
      return
    }
    this.resizingElement.resize(...args)
  }
  endResize() {
    this.isResizing = false
    this.resizingElement.endResize()
    this.resizingElement = null
  }
}
class ImageEdit extends EventEmitter {
  constructor(app) {
    super()
    this.app = app
    this.el = null
    this.isReady = false
    this.previewEl = null
    this.imageData = null
    this.maxWidth = 750
    this.maxHeight = 450
    this.maxRatio = this.maxWidth / this.maxHeight
    this.onImageSelectChange = this.onImageSelectChange.bind(this)
  }
  reset() {
    this.el.value = ''
    this.isReady = false
    document.body.removeChild(this.previewEl)
    this.previewEl = null
    this.imageData = null
  }
  selectImage() {
    if (!this.el) {
      this.el = document.createElement('input')
      this.el.type = 'file'
      this.el.accept = 'image/*'
      this.el.style.position = 'fixed'
      this.el.style.left = '-999999px'
      this.el.addEventListener('change', this.onImageSelectChange)
      document.body.appendChild(this.el)
    }
    this.el.click()
  }
  updatePreviewElPos(x, y) {
    let width = 100
    let height = width / this.imageData.ratio
    if (!this.previewEl) {
      this.previewEl = document.createElement('div')
      this.previewEl.style.position = 'fixed'
      this.previewEl.style.width = width + 'px'
      this.previewEl.style.height = height + 'px'
      this.previewEl.style.backgroundImage = `url('${this.imageData.url}')`
      this.previewEl.style.backgroundSize = 'cover'
      this.previewEl.style.pointerEvents = 'none'
      document.body.appendChild(this.previewEl)
    }
    let tp = this.app.coordinate.containerToWindow(x, y)
    this.previewEl.style.left = tp.x - width / 2 + 'px'
    this.previewEl.style.top = tp.y - height / 2 + 'px'
  }
  getImageSize(url) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        let img = new Image()
        img.setAttribute('crossOrigin', 'anonymous')
        img.onload = () => {
          let width = img.width
          let height = img.height
          let ratio = img.width / img.height
          if (img.width > this.maxWidth || img.height > this.maxHeight) {
            if (ratio > this.maxRatio) {
              width = this.maxWidth
              height = this.maxWidth / ratio
            } else {
              height = this.maxHeight
              width = this.maxHeight * ratio
            }
          }
          resolve({
            imageObj: img,
            size: {
              width,
              height
            },
            ratio
          })
        }
        img.onerror = () => {
          reject()
        }
        img.src = url
      })
    })
  }
  onImageSelectChange(e) {
    return __async(this, null, function* () {
      let url = yield this.getImageUrl(e.target.files[0])
      let { imageObj, size, ratio } = yield this.getImageSize(url)
      this.isReady = true
      this.imageData = __spreadProps(
        __spreadValues(
          {
            url
          },
          size
        ),
        {
          ratio,
          imageObj
        }
      )
      this.emit('imageSelectChange', this.imageData)
    })
  }
  getImageUrl(file) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result)
        }
        reader.onerror = () => {
          reject()
        }
        reader.readAsDataURL(file)
      })
    })
  }
}
class Cursor {
  constructor(app) {
    this.app = app
    this.currentType = 'default'
  }
  set(type = 'default') {
    this.currentType = type
    let style = type
    if (type === 'eraser') {
      style = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAARRJREFUOE/dlDFLxEAQhd+BVouFZ3vlQuwSyI+5a7PBRkk6k9KzTOwStJFsWv0xgaQzkNLWszim0kL2OOFc9oKRYHFTz37Lm/dmJhi5JiPzcBjAOYDz7WheADz3jalP8oIxds85P3Zd90RBqqpad133SUSXAJ5M4H3AhWVZd1EUzYQQP96VZYkkSV7btr02QY1Axtgqz/NTz/OM6qSUCMNwRURneoMJOLdt+7Gu643MfeU4zrppmgt9pibgjRBiWRRFb0R934eUcgngdrfxX4CjSwZj7C3Lsqnu8Lc05XQQBO9ENP2NKapnE5s4jme608rhNE2HxWb7qwr2A+f8SAv2BxFdDQ32rpLRVu9Pl+0wztcg6V/VPW4Vw1FsawAAAABJRU5ErkJggg==) 10 10, auto`
    }
    this.app.container.style.cursor = style
  }
  hide() {
    this.set('none')
  }
  reset() {
    this.set()
  }
  setCrosshair() {
    this.set('crosshair')
  }
  setMove() {
    this.set('move')
  }
  setResize(dir) {
    let type = ''
    switch (dir) {
      case DRAG_ELEMENT_PARTS.BODY:
        type = 'move'
        break
      case DRAG_ELEMENT_PARTS.ROTATE:
        type = 'grab'
        break
      case DRAG_ELEMENT_PARTS.TOP_LEFT_BTN:
        type = 'nw-resize'
        break
      case DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN:
        type = 'ne-resize'
        break
      case DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN:
        type = 'se-resize'
        break
      case DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN:
        type = 'sw-resize'
        break
    }
    this.set(type)
  }
  setEraser() {
    this.set('eraser')
  }
}
class TextEdit extends EventEmitter {
  constructor(app) {
    super()
    this.app = app
    this.editable = null
    this.isEditing = false
    this.onTextInput = this.onTextInput.bind(this)
    this.onTextBlur = this.onTextBlur.bind(this)
  }
  crateTextInputEl() {
    this.editable = document.createElement('textarea')
    this.editable.dir = 'auto'
    this.editable.tabIndex = 0
    this.editable.wrap = 'off'
    this.editable.className = 'textInput'
    Object.assign(this.editable.style, {
      position: 'fixed',
      display: 'block',
      minHeight: '1em',
      backfaceVisibility: 'hidden',
      margin: 0,
      padding: 0,
      border: 0,
      outline: 0,
      resize: 'none',
      background: 'transparent',
      overflow: 'hidden',
      whiteSpace: 'pre'
    })
    this.editable.addEventListener('input', this.onTextInput)
    this.editable.addEventListener('blur', this.onTextBlur)
    document.body.appendChild(this.editable)
  }
  updateTextInputStyle() {
    let activeElement = this.app.elements.activeElement
    if (!activeElement) {
      return
    }
    let { x, y, width, height, style, text, rotate } = activeElement
    let { coordinate, state } = this.app
    this.editable.value = text
    x = coordinate.subScrollX(x)
    y = coordinate.subScrollY(y)
    let sp = coordinate.scale(x, y)
    let tp = coordinate.containerToWindow(sp.x, sp.y)
    let fontSize = style.fontSize * state.scale
    let styles = {
      font: getFontString(fontSize, style.fontFamily),
      lineHeight: `${fontSize * style.lineHeightRatio}px`,
      left: `${tp.x}px`,
      top: `${tp.y}px`,
      color: style.fillStyle,
      width: Math.max(width, 100) * state.scale + 'px',
      height: height * state.scale + 'px',
      transform: `rotate(${rotate}deg)`,
      opacity: style.globalAlpha
    }
    Object.assign(this.editable.style, styles)
  }
  onTextInput() {
    let activeElement = this.app.elements.activeElement
    if (!activeElement) {
      return
    }
    activeElement.text = this.editable.value
    let { width, height } = getTextElementSize(activeElement)
    activeElement.width = width
    activeElement.height = height
    this.updateTextInputStyle()
  }
  onTextBlur() {
    this.editable.style.display = 'none'
    this.editable.value = ''
    this.emit('blur')
    this.isEditing = false
  }
  showTextEdit() {
    if (!this.editable) {
      this.crateTextInputEl()
    } else {
      this.editable.style.display = 'block'
    }
    this.updateTextInputStyle()
    this.editable.focus()
    this.editable.select()
    this.isEditing = true
  }
}
class History {
  constructor(app) {
    this.app = app
    this.historyStack = []
    this.length = 0
    this.index = -1
  }
  add(data) {
    let prev = this.length > 0 ? this.historyStack[this.length - 1] : null
    let copyData = deepCopy(data)
    if (copyData === prev) {
      return
    }
    this.historyStack.push(copyData)
    this.length++
    this.index = this.length - 1
    this.emitChange()
  }
  undo() {
    if (this.index <= 0) {
      return
    }
    this.index--
    this.shuttle()
  }
  redo() {
    if (this.index >= this.length - 1) {
      return
    }
    this.index++
    this.shuttle()
  }
  shuttle() {
    return __async(this, null, function* () {
      let data = this.historyStack[this.index]
      yield this.app.setData(data, true)
      this.emitChange()
      this.app.emit('change', data)
    })
  }
  clear() {
    this.index = -1
    this.length = 0
    this.historyStack = []
    this.emitChange()
  }
  emitChange() {
    this.app.emit('shuttle', this.index, this.length)
  }
}
class Export {
  constructor(app) {
    this.app = app
    this.openTest = false
    this.saveState = {
      scale: 0,
      scrollX: 0,
      scrollY: 0,
      width: 0,
      height: 0
    }
  }
  show(canvas) {
    if (this.openTest) {
      canvas.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        background-color: #fff;
      `
      document.body.appendChild(canvas)
    }
  }
  getElementList(onlySelected = true) {
    if (!onlySelected) {
      return this.app.elements.elementList
    } else {
      let selectedElements = []
      if (this.app.elements.activeElement) {
        selectedElements.push(this.app.elements.activeElement)
      } else if (this.app.selection.hasSelectionElements()) {
        selectedElements = this.app.selection.getSelectionElements()
      }
      let res = this.app.elements.elementList.filter(element => {
        return selectedElements.includes(element)
      })
      return res
    }
  }
  exportImage({
    type = 'image/png',
    renderBg = true,
    useBlob = false,
    paddingX = 10,
    paddingY = 10,
    onlySelected
  } = {}) {
    let { minx, maxx, miny, maxy } = getMultiElementRectInfo(
      this.getElementList(onlySelected)
    )
    let width = maxx - minx + paddingX * 2
    let height = maxy - miny + paddingY * 2
    let { canvas, ctx } = createCanvas(width, height, {
      noStyle: true,
      noTranslate: true
    })
    this.show(canvas)
    this.saveAppState()
    this.changeAppState(minx - paddingX, miny - paddingY, ctx)
    if (renderBg && this.app.state.backgroundColor) {
      this.app.background.canvasAddBackgroundColor(
        ctx,
        width,
        height,
        this.app.state.backgroundColor
      )
    }
    this.render(ctx, onlySelected)
    this.recoveryAppState()
    if (useBlob) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob)
          } else {
            reject()
          }
        }, type)
      })
    } else {
      return canvas.toDataURL(type)
    }
  }
  saveAppState() {
    let { width, height, state, ctx } = this.app
    this.saveState.width = width
    this.saveState.height = height
    this.saveState.scale = state.scale
    this.saveState.scrollX = state.scrollX
    this.saveState.scrollY = state.scrollY
    this.saveState.ctx = ctx
  }
  changeAppState(minx, miny, ctx) {
    this.app.ctx = ctx
    this.app.state.scale = 1
    this.app.state.scrollX = 0
    this.app.state.scrollY = 0
    this.app.width = minx * 2
    this.app.height = miny * 2
  }
  recoveryAppState() {
    let { width, height, scale, scrollX, scrollY, ctx } = this.saveState
    this.app.state.scale = scale
    this.app.state.scrollX = scrollX
    this.app.state.scrollY = scrollY
    this.app.width = width
    this.app.height = height
    this.app.ctx = ctx
  }
  render(ctx, onlySelected) {
    ctx.save()
    this.getElementList(onlySelected).forEach(element => {
      if (element.noRender) {
        return
      }
      let cacheActive = element.isActive
      let cacheSelected = element.isSelected
      element.isActive = false
      element.isSelected = false
      element.render()
      element.isActive = cacheActive
      element.isSelected = cacheSelected
    })
    ctx.restore()
  }
  exportJson() {
    return this.app.getData()
  }
}
class Background {
  constructor(app) {
    this.app = app
  }
  set() {
    if (this.app.state.backgroundColor) {
      this.addBackgroundColor()
    } else {
      this.remove()
    }
  }
  addBackgroundColor() {
    this.app.container.style.backgroundColor = this.app.state.backgroundColor
  }
  remove() {
    this.app.container.style.backgroundColor = ''
  }
  canvasAddBackgroundColor(ctx, width, height, backgroundColor) {
    ctx.save()
    ctx.rect(0, 0, width, height)
    ctx.fillStyle = backgroundColor
    ctx.fill()
    ctx.restore()
  }
}
class Canvas {
  constructor(width, height, opt) {
    this.width = width
    this.height = height
    let { canvas, ctx } = createCanvas(width, height, opt)
    this.el = canvas
    this.ctx = ctx
  }
  clearCanvas() {
    let { width, height } = this
    this.ctx.clearRect(-width / 2, -height / 2, width, height)
  }
}
class MultiSelectElement extends BaseElement {
  constructor(opts = {}, app) {
    super(opts, app)
    this.dragElement = new DragElement(this, this.app)
    this.selectedElementList = []
    this.wholeCenterPos = { x: 0, y: 0 }
  }
  setSelectedElementList(list) {
    this.selectedElementList.forEach(element => {
      element.isSelected = false
    })
    this.selectedElementList = list
    this.selectedElementList.forEach(element => {
      element.isSelected = true
    })
  }
  updateElements(elements) {
    let exists = []
    this.selectedElementList.forEach(element => {
      if (elements.includes(element)) {
        exists.push(element)
      }
    })
    this.setSelectedElementList(exists)
  }
  updateRect() {
    if (this.selectedElementList.length <= 0) {
      super.updateRect(0, 0, 0, 0)
      return
    }
    let { minx, maxx, miny, maxy } = getMultiElementRectInfo(
      this.selectedElementList
    )
    super.updateRect(minx, miny, maxx - minx, maxy - miny)
  }
  startResize(...args) {
    this.selectedElementList.forEach(element => {
      if (args[0] === 'rotate') {
        this.wholeCenterPos = getElementCenterPoint(this)
      }
      element.startResize(...args)
    })
  }
  resize(...args) {
    this.selectedElementList.forEach(element => {
      if (element.dragElement.resizeType === 'rotate') {
        this.handleRotate(element, ...args)
      } else {
        element.resize(...args)
      }
    })
  }
  handleRotate(element, e, mx, my, offsetX, offsetY) {
    let rotate = getTowPointRotate(
      this.wholeCenterPos.x,
      this.wholeCenterPos.y,
      e.clientX,
      e.clientY,
      mx,
      my
    )
    element.rotateByCenter(rotate, this.wholeCenterPos.x, this.wholeCenterPos.y)
  }
  endResize() {
    this.selectedElementList.forEach(element => {
      element.endResize()
    })
  }
  render() {
    if (this.selectedElementList.length > 0) {
      if (this.width <= 0 || this.height <= 0) {
        return
      }
      this.dragElement.render()
    }
  }
}
class Selection {
  constructor(app) {
    this.app = app
    this.canvas = null
    this.ctx = null
    this.creatingSelection = false
    this.hasSelection = false
    this.isResizing = false
    this.state = this.app.state
    this.width = this.app.width
    this.height = this.app.height
    this.coordinate = new Coordinate(this)
    this.rectangle = new Rectangle(
      {
        type: 'rectangle',
        style: {
          strokeStyle: 'rgba(9,132,227,0.3)',
          fillStyle: 'rgba(9,132,227,0.3)'
        }
      },
      this
    )
    this.multiSelectElement = new MultiSelectElement(
      {
        type: 'multiSelectElement'
      },
      this
    )
    this.checkInNodes = throttle(this.checkInNodes, this, 500)
    this.handleResize = throttle(this.handleResize, this, 16)
    this.init()
    this.bindEvent()
  }
  init() {
    if (this.canvas) {
      this.app.container.removeChild(this.canvas.el)
    }
    this.width = this.app.width
    this.height = this.app.height
    this.canvas = new Canvas(this.width, this.height, {
      className: 'selection'
    })
    this.ctx = this.canvas.ctx
    this.app.container.appendChild(this.canvas.el)
  }
  bindEvent() {
    this.app.on('change', () => {
      this.state = this.app.state
      this.multiSelectElement.updateElements(this.app.elements.elementList)
      this.renderSelection()
    })
    this.app.on('scrollChange', () => {
      this.renderSelection()
    })
    this.app.on('zoomChange', () => {
      this.renderSelection()
    })
  }
  onMousedown(e, event) {
    if (e.originEvent.which !== 1) {
      return
    }
    this.creatingSelection = true
    this.rectangle.updatePos(event.mousedownPos.x, event.mousedownPos.y)
  }
  onMousemove(e, event) {
    if (
      Math.abs(event.mouseOffset.x) <= 10 &&
      Math.abs(event.mouseOffset.y) <= 10
    ) {
      return
    }
    this.onMove(e, event)
  }
  onMouseup() {
    this.creatingSelection = false
    this.rectangle.updateRect(0, 0, 0, 0)
    this.hasSelection = this.hasSelectionElements()
    this.multiSelectElement.updateRect()
    this.renderSelection()
    this.emitChange()
  }
  reset() {
    this.setMultiSelectElements([])
    this.hasSelection = false
    this.renderSelection()
    this.emitChange()
  }
  renderSelection() {
    this.canvas.clearCanvas()
    this.ctx.save()
    this.ctx.scale(this.app.state.scale, this.app.state.scale)
    this.rectangle.render()
    this.multiSelectElement.render()
    this.ctx.restore()
  }
  onMove(e, event) {
    this.rectangle.updateSize(event.mouseOffset.x, event.mouseOffset.y)
    this.renderSelection()
    this.checkInElements(e, event)
  }
  checkInElements(e, event) {
    let minx = Math.min(event.mousedownPos.x, e.clientX)
    let miny = Math.min(event.mousedownPos.y, e.clientY)
    let maxx = Math.max(event.mousedownPos.x, e.clientX)
    let maxy = Math.max(event.mousedownPos.y, e.clientY)
    let selectedElementList = []
    this.app.elements.elementList.forEach(element => {
      let _minx = Infinity
      let _maxx = -Infinity
      let _miny = Infinity
      let _maxy = -Infinity
      let endPointList = element.getEndpointList()
      let rect = getBoundingRect(
        endPointList.map(point => {
          return [point.x, point.y]
        }),
        true
      )
      rect.forEach(({ x, y }) => {
        if (x < _minx) {
          _minx = x
        }
        if (x > _maxx) {
          _maxx = x
        }
        if (y < _miny) {
          _miny = y
        }
        if (y > _maxy) {
          _maxy = y
        }
      })
      if (_minx >= minx && _maxx <= maxx && _miny >= miny && _maxy <= maxy) {
        selectedElementList.push(element)
      }
    })
    this.setMultiSelectElements(selectedElementList, true)
    this.app.render.render()
  }
  checkInResizeHand(x, y) {
    return this.multiSelectElement.dragElement.checkPointInDragElementWhere(
      x,
      y
    )
  }
  checkIsResize(x, y, e) {
    if (!this.hasSelection) {
      return false
    }
    let hand = this.multiSelectElement.dragElement.checkPointInDragElementWhere(
      x,
      y
    )
    if (hand) {
      this.isResizing = true
      this.multiSelectElement.startResize(hand, e)
      this.app.cursor.setResize(hand)
      return true
    }
    return false
  }
  handleResize(...args) {
    if (!this.isResizing) {
      return
    }
    this.multiSelectElement.resize(...args)
    this.app.render.render()
    this.multiSelectElement.updateRect()
    this.renderSelection()
  }
  endResize() {
    this.isResizing = false
    this.multiSelectElement.endResize()
  }
  setSelectedElementStyle(style = {}) {
    if (!this.hasSelectionElements()) {
      return
    }
    Object.keys(style).forEach(key => {
      this.getSelectionElements().forEach(element => {
        element.style[key] = style[key]
      })
    })
    this.app.render.render()
    this.app.emitChange()
  }
  deleteSelectedElements() {
    this.getSelectionElements().forEach(element => {
      this.app.elements.deleteElement(element)
    })
    this.selectElements([])
    this.app.emitChange()
  }
  hasSelectionElements() {
    return this.getSelectionElements().length > 0
  }
  getSelectionElements() {
    return this.multiSelectElement.selectedElementList
  }
  copySelectionElements(pos) {
    return __async(this, null, function* () {
      let task = this.getSelectionElements().map(element => {
        return this.app.elements.copyElement(element, true)
      })
      this.app.group.clearCopyMap()
      let elements = yield Promise.all(task)
      this.setMultiSelectElements(elements)
      if (pos) {
        this.multiSelectElement.startResize(DRAG_ELEMENT_PARTS.BODY)
        let ox =
          pos.x - this.multiSelectElement.x - this.multiSelectElement.width / 2
        let oy =
          pos.y - this.multiSelectElement.y - this.multiSelectElement.height / 2
        let gridAdsorbentPos = this.app.coordinate.gridAdsorbent(ox, oy)
        this.multiSelectElement.resize(
          null,
          null,
          null,
          gridAdsorbentPos.x,
          gridAdsorbentPos.y
        )
        this.multiSelectElement.endResize()
        this.multiSelectElement.updateRect()
      }
      this.app.render.render()
      this.renderSelection()
      this.app.emitChange()
    })
  }
  selectElements(elements = []) {
    this.hasSelection = elements.length > 0
    this.setMultiSelectElements(elements)
    this.app.render.render()
    this.renderSelection()
    this.emitChange()
  }
  setMultiSelectElements(elements = [], notUpdateRect) {
    this.multiSelectElement.setSelectedElementList(elements)
    if (!notUpdateRect) {
      this.multiSelectElement.updateRect()
    }
  }
  emitChange() {
    this.app.emit('multiSelectChange', this.getSelectionElements())
  }
}
class Grid {
  constructor(app) {
    this.app = app
    this.canvas = null
    this.ctx = null
    this.init()
    this.app.on('zoomChange', this.renderGrid, this)
    this.app.on('scrollChange', this.renderGrid, this)
  }
  init() {
    if (this.canvas) {
      this.app.container.removeChild(this.canvas.el)
    }
    let { width, height } = this.app
    this.canvas = new Canvas(width, height, {
      className: 'grid'
    })
    this.ctx = this.canvas.ctx
    this.app.container.insertBefore(
      this.canvas.el,
      this.app.container.children[0]
    )
  }
  drawHorizontalLine(i) {
    let { coordinate, width, state } = this.app
    let _i = coordinate.subScrollY(i)
    this.ctx.beginPath()
    this.ctx.moveTo(-width / state.scale / 2, _i)
    this.ctx.lineTo(width / state.scale / 2, _i)
    this.ctx.stroke()
  }
  renderHorizontalLines() {
    let { coordinate, height, state } = this.app
    let { gridConfig, scale } = state
    let maxBottom = 0
    for (let i = -height / 2; i < height / 2; i += gridConfig.size) {
      this.drawHorizontalLine(i)
      maxBottom = i
    }
    for (
      let i = -height / 2 - gridConfig.size;
      i > -coordinate.subScrollY(height / scale / 2);
      i -= gridConfig.size
    ) {
      this.drawHorizontalLine(i)
    }
    for (
      let i = maxBottom + gridConfig.size;
      i < coordinate.addScrollY(height / scale / 2);
      i += gridConfig.size
    ) {
      this.drawHorizontalLine(i)
    }
  }
  drawVerticalLine(i) {
    let { coordinate, height, state } = this.app
    let _i = coordinate.subScrollX(i)
    this.ctx.beginPath()
    this.ctx.moveTo(_i, -height / state.scale / 2)
    this.ctx.lineTo(_i, height / state.scale / 2)
    this.ctx.stroke()
  }
  renderVerticalLines() {
    let { coordinate, width, state } = this.app
    let { gridConfig, scale } = state
    let maxRight = 0
    for (let i = -width / 2; i < width / 2; i += gridConfig.size) {
      this.drawVerticalLine(i)
      maxRight = i
    }
    for (
      let i = -width / 2 - gridConfig.size;
      i > -coordinate.subScrollX(width / scale / 2);
      i -= gridConfig.size
    ) {
      this.drawVerticalLine(i)
    }
    for (
      let i = maxRight + gridConfig.size;
      i < coordinate.addScrollX(width / scale / 2);
      i += gridConfig.size
    ) {
      this.drawVerticalLine(i)
    }
  }
  renderGrid() {
    this.canvas.clearCanvas()
    let { gridConfig, scale, showGrid } = this.app.state
    if (!showGrid) {
      return
    }
    this.ctx.save()
    this.ctx.scale(scale, scale)
    this.ctx.strokeStyle = gridConfig.strokeStyle
    this.ctx.lineWidth = gridConfig.lineWidth
    this.renderHorizontalLines()
    this.renderVerticalLines()
    this.ctx.restore()
  }
  showGrid() {
    this.app.updateState({
      showGrid: true
    })
    this.renderGrid()
  }
  hideGrid() {
    this.app.updateState({
      showGrid: false
    })
    this.canvas.clearCanvas()
  }
  updateGrid(config = {}) {
    this.app.updateState({
      gridConfig: __spreadValues(
        __spreadValues({}, this.app.state.gridConfig),
        config
      )
    })
    if (this.app.state.showGrid) {
      this.hideGrid()
      this.showGrid()
    }
  }
}
const map = {
  Backspace: 8,
  Tab: 9,
  Enter: 13,
  Shift: 16,
  Control: 17,
  Alt: 18,
  CapsLock: 20,
  Esc: 27,
  Space: 32,
  PageUp: 33,
  PageDown: 34,
  End: 35,
  Home: 36,
  Insert: 45,
  Left: 37,
  Up: 38,
  Right: 39,
  Down: 40,
  Del: 46,
  NumLock: 144,
  Cmd: 91,
  CmdFF: 224,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  '`': 192,
  '=': 187,
  '+': 187,
  '-': 189,
  "'": 222,
  '/': 191,
  '.': 190
}
for (let i = 0; i <= 9; i++) {
  map[i] = i + 48
}
'abcdefghijklmnopqrstuvwxyz'.split('').forEach((n, index) => {
  map[n] = index + 65
})
const keyMap = map
class Mode {
  constructor(app) {
    this.app = app
    this.startScrollX = 0
    this.startScrollY = 0
    this.isDragMode = false
    this.onMove = throttle(this.onMove, this, 16)
    this.bindEvent()
  }
  bindEvent() {
    this.app.event.on('keydown', e => {
      if (e.keyCode === keyMap.Space) {
        this.isDragMode = true
        this.app.cursor.set('grab')
      }
    })
    this.app.event.on('keyup', e => {
      if (this.isDragMode) {
        this.isDragMode = false
        this.app.cursor.set('default')
      }
    })
  }
  setEditMode() {
    this.app.cursor.set('default')
    this.app.updateState({
      readonly: false
    })
  }
  setReadonlyMode() {
    this.app.cursor.set('grab')
    this.app.updateState({
      readonly: true
    })
  }
  onStart() {
    this.startScrollX = this.app.state.scrollX
    this.startScrollY = this.app.state.scrollY
  }
  onMove(e, event) {
    this.app.scrollTo(
      this.startScrollX - event.mouseOffset.originX / this.app.state.scale,
      this.startScrollY - event.mouseOffset.originY / this.app.state.scale
    )
  }
  onEnd() {
    this.startScrollX = 0
    this.startScrollY = 0
  }
}
class KeyCommand {
  constructor(app) {
    this.app = app
    this.keyMap = keyMap
    this.shortcutMap = {}
    this.bindEvent()
  }
  bindEvent() {
    this.app.event.on('keydown', this.onKeydown, this)
  }
  unBindEvent() {
    this.app.event.off('keydown', this.onKeydown)
  }
  onKeydown(e) {
    Object.keys(this.shortcutMap).forEach(key => {
      if (this.checkKey(e, key)) {
        e.stopPropagation()
        e.preventDefault()
        this.shortcutMap[key].forEach(f => {
          f.fn.call(f.ctx)
        })
      }
    })
  }
  checkKey(e, key) {
    let o = this.getOriginEventCodeArr(e)
    let k = this.getKeyCodeArr(key)
    if (o.length !== k.length) {
      return false
    }
    for (let i = 0; i < o.length; i++) {
      let index = k.findIndex(item => {
        return item === o[i]
      })
      if (index === -1) {
        return false
      } else {
        k.splice(index, 1)
      }
    }
    return true
  }
  getOriginEventCodeArr(e) {
    let arr = []
    if (e.ctrlKey || e.metaKey) {
      arr.push(keyMap['Control'])
    }
    if (e.altKey) {
      arr.push(keyMap['Alt'])
    }
    if (e.shiftKey) {
      arr.push(keyMap['Shift'])
    }
    if (!arr.includes(e.keyCode)) {
      arr.push(e.keyCode)
    }
    return arr
  }
  getKeyCodeArr(key) {
    key = key.replace(/\+\+/, '+add')
    let keyArr = key.split(/\s*\+\s*/).map(item => {
      return item === 'add' ? '+' : item
    })
    let arr = []
    keyArr.forEach(item => {
      arr.push(keyMap[item])
    })
    return arr
  }
  addShortcut(key, fn, ctx) {
    key.split(/\s*\|\s*/).forEach(item => {
      if (this.shortcutMap[item]) {
        this.shortcutMap[item].push({
          fn,
          ctx
        })
      } else {
        this.shortcutMap[item] = [
          {
            fn,
            ctx
          }
        ]
      }
    })
  }
  removeShortcut(key, fn) {
    key.split(/\s*\|\s*/).forEach(item => {
      if (this.shortcutMap[item]) {
        if (fn) {
          let index = this.shortcutMap[item].findIndex(f => {
            return f.fn === fn
          })
          if (index !== -1) {
            this.shortcutMap[item].splice(index, 1)
          }
        } else {
          this.shortcutMap[item] = []
          delete this.shortcutMap[item]
        }
      }
    })
  }
}
class Render {
  constructor(app) {
    this.app = app
    this.beingCopyActiveElement = null
    this.beingCopySelectedElements = []
    this.registerShortcutKeys()
  }
  clearCanvas() {
    let { width, height } = this.app
    this.app.ctx.clearRect(-width / 2, -height / 2, width, height)
    return this
  }
  render() {
    let { state } = this.app
    this.clearCanvas()
    this.app.ctx.save()
    this.app.ctx.scale(state.scale, state.scale)
    this.app.elements.elementList.forEach(element => {
      if (element.noRender) {
        return
      }
      element.render()
    })
    this.app.ctx.restore()
    return this
  }
  registerShortcutKeys() {
    this.app.keyCommand.addShortcut('Del|Backspace', () => {
      this.deleteCurrentElements()
    })
    this.app.keyCommand.addShortcut('Control+c', () => {
      this.copyCurrentElement()
    })
    this.app.keyCommand.addShortcut('Control+x', () => {
      this.cutCurrentElement()
    })
    this.app.keyCommand.addShortcut('Control+z', () => {
      this.app.history.undo()
    })
    this.app.keyCommand.addShortcut('Control+y', () => {
      this.app.history.redo()
    })
    this.app.keyCommand.addShortcut('Control+v', () => {
      this.pasteCurrentElement(true)
    })
    this.app.keyCommand.addShortcut('Control++', () => {
      this.zoomIn()
    })
    this.app.keyCommand.addShortcut('Control+-', () => {
      this.zoomOut()
    })
    this.app.keyCommand.addShortcut('Shift+1', () => {
      this.fit()
    })
    this.app.keyCommand.addShortcut('Control+a', () => {
      this.selectAll()
    })
    this.app.keyCommand.addShortcut('Control+0', () => {
      this.setZoom(1)
    })
    this.app.keyCommand.addShortcut("Control+'", () => {
      if (this.app.state.showGrid) {
        this.app.grid.hideGrid()
      } else {
        this.app.grid.showGrid()
      }
    })
  }
  copyCurrentElement() {
    if (this.app.elements.activeElement) {
      this.beingCopySelectedElements = []
      this.beingCopyElement = this.app.elements.activeElement
    } else if (this.app.selection.hasSelectionElements()) {
      this.beingCopyElement = null
      this.beingCopySelectedElements = this.app.selection.getSelectionElements()
    }
  }
  cutCurrentElement() {
    if (this.app.elements.activeElement) {
      this.copyCurrentElement()
      this.deleteCurrentElements()
    } else if (this.app.selection.hasSelectionElements()) {
      this.copyCurrentElement()
      this.deleteCurrentElements()
      this.app.selection.setMultiSelectElements(this.beingCopySelectedElements)
      this.app.selection.emitChange()
    }
  }
  pasteCurrentElement(useCurrentEventPos = false) {
    let pos = null
    if (useCurrentEventPos) {
      let x = this.app.event.lastMousePos.x
      let y = this.app.event.lastMousePos.y
      pos = {
        x,
        y
      }
    }
    if (this.beingCopyElement) {
      this.copyElement(this.beingCopyElement, false, pos)
    } else if (this.beingCopySelectedElements.length > 0) {
      this.app.selection.selectElements(this.beingCopySelectedElements)
      this.app.selection.copySelectionElements(useCurrentEventPos ? pos : null)
    }
  }
  deleteElement(element) {
    this.app.elements.deleteElement(element)
    this.render()
    this.app.emitChange()
  }
  copyElement(element, notActive = false, pos) {
    return __async(this, null, function* () {
      this.app.elements.cancelActiveElement()
      yield this.app.elements.copyElement(element, notActive, pos)
      this.app.group.clearCopyMap()
      this.render()
      this.app.emitChange()
    })
  }
  deleteActiveElement() {
    if (!this.app.elements.hasActiveElement()) {
      return
    }
    this.deleteElement(this.app.elements.activeElement)
  }
  deleteCurrentElements() {
    this.deleteActiveElement()
    this.app.selection.deleteSelectedElements()
  }
  moveUpCurrentElement() {
    this.moveLevelCurrentElement('up')
  }
  moveDownCurrentElement() {
    this.moveLevelCurrentElement('down')
  }
  moveTopCurrentElement() {
    this.moveLevelCurrentElement('top')
  }
  moveBottomCurrentElement() {
    this.moveLevelCurrentElement('bottom')
  }
  moveLevelCurrentElement(level) {
    let element = null
    if (this.app.elements.hasActiveElement()) {
      element = this.app.elements.activeElement
    } else if (this.app.selection.getSelectionElements().length === 1) {
      element = this.app.selection.getSelectionElements()[0]
    }
    if (!element) {
      return
    }
    let index = this.app.elements.getElementIndex(element)
    this.app.elements.elementList.splice(index, 1)
    if (level === 'up') {
      this.app.elements.insertElement(element, index + 1)
    } else if (level === 'down') {
      this.app.elements.insertElement(element, index - 1)
    } else if (level === 'top') {
      this.app.elements.addElement(element)
    } else if (level === 'bottom') {
      this.app.elements.unshiftElement(element)
    }
  }
  setActiveElementStyle(style = {}) {
    if (!this.app.elements.hasActiveElement()) {
      return this
    }
    this.app.elements.setActiveElementStyle(style)
    this.render()
    if (!this.app.elements.isCreatingElement) {
      this.app.emitChange()
    }
    return this
  }
  setCurrentElementsStyle(style = {}) {
    this.setActiveElementStyle(style)
    this.app.selection.setSelectedElementStyle(style)
  }
  cancelActiveElement() {
    if (!this.app.elements.hasActiveElement()) {
      return this
    }
    this.app.elements.cancelActiveElement()
    this.render()
    return this
  }
  updateActiveElementPosition(x, y) {
    if (!this.app.elements.hasActiveElement()) {
      return this
    }
    this.app.elements.activeElement.updatePos(x, y)
    this.render()
    return this
  }
  updateActiveElementSize(width, height) {
    if (!this.app.elements.hasActiveElement()) {
      return this
    }
    this.app.elements.activeElement.updateSize(width, height)
    this.render()
    return this
  }
  updateActiveElementRotate(rotate) {
    if (!this.app.elements.hasActiveElement()) {
      return this
    }
    this.app.elements.activeElement.updateRotate(rotate)
    this.render()
    return this
  }
  empty() {
    this.app.elements.deleteAllElements()
    this.render()
    this.app.history.clear()
    this.app.emitChange()
  }
  zoomIn(num = 0.1) {
    this.app.updateState({
      scale: this.app.state.scale + num
    })
    this.render()
    this.app.emit('zoomChange', this.app.state.scale)
  }
  zoomOut(num = 0.1) {
    this.app.updateState({
      scale: this.app.state.scale - num > 0 ? this.app.state.scale - num : 0
    })
    this.render()
    this.app.emit('zoomChange', this.app.state.scale)
  }
  setZoom(zoom) {
    if (zoom < 0 || zoom > 1) {
      return
    }
    this.app.updateState({
      scale: zoom
    })
    this.render()
    this.app.emit('zoomChange', this.app.state.scale)
  }
  fit() {
    if (!this.app.elements.hasElements()) {
      return
    }
    this.scrollToCenter()
    let { minx, maxx, miny, maxy } = getMultiElementRectInfo(
      this.app.elements.elementList
    )
    let width = maxx - minx
    let height = maxy - miny
    let maxScale = Math.min(this.app.width / width, this.app.height / height)
    this.setZoom(maxScale)
  }
  scrollTo(scrollX, scrollY) {
    this.app.updateState({
      scrollX,
      scrollY
    })
    this.render()
    this.app.emit(
      'scrollChange',
      this.app.state.scrollX,
      this.app.state.scrollY
    )
  }
  scrollToCenter() {
    if (!this.app.elements.hasElements()) {
      this.scrollTo(0, 0)
      return
    }
    let { minx, maxx, miny, maxy } = getMultiElementRectInfo(
      this.app.elements.elementList
    )
    let width = maxx - minx
    let height = maxy - miny
    this.scrollTo(
      minx - (this.app.width - width) / 2,
      miny - (this.app.height - height) / 2
    )
  }
  copyPasteCurrentElements() {
    this.copyCurrentElement()
    this.pasteCurrentElement()
  }
  setBackgroundColor(color) {
    this.app.updateState({
      backgroundColor: color
    })
    this.app.background.set()
  }
  selectAll() {
    this.app.selection.selectElements(this.app.elements.elementList)
  }
}
class Elements {
  constructor(app) {
    this.app = app
    this.elementList = []
    this.activeElement = null
    this.isCreatingElement = false
    this.isResizing = false
    this.resizingElement = null
    this.handleResize = throttle(this.handleResize, this, 16)
  }
  serialize(stringify = false) {
    let data = this.elementList.map(element => {
      return element.serialize()
    })
    return stringify ? JSON.stringify(data) : data
  }
  getElementsNum() {
    return this.elementList.length
  }
  hasElements() {
    return this.elementList.length > 0
  }
  addElement(element) {
    this.elementList.push(element)
    return this
  }
  unshiftElement(element) {
    this.elementList.unshift(element)
    return this
  }
  insertElement(element, index) {
    this.elementList.splice(index, 0, element)
  }
  deleteElement(element) {
    let index = this.getElementIndex(element)
    if (index !== -1) {
      this.elementList.splice(index, 1)
      if (element.isActive) {
        this.cancelActiveElement(element)
      }
    }
    return this
  }
  deleteAllElements() {
    this.activeElement = null
    this.elementList = []
    this.isCreatingElement = false
    this.isResizing = false
    this.resizingElement = null
    return this
  }
  getElementIndex(element) {
    return this.elementList.findIndex(item => {
      return item === element
    })
  }
  createElementsFromData(data) {
    data.forEach(item => {
      let element = this.pureCreateElement(item)
      element.isActive = false
      element.isCreating = false
      this.addElement(element)
    })
    this.app.group.initIdToElementList(this.elementList)
    return this
  }
  hasActiveElement() {
    return !!this.activeElement
  }
  setActiveElement(element) {
    this.cancelActiveElement()
    this.activeElement = element
    if (element) {
      element.isActive = true
    }
    this.app.emit('activeElementChange', this.activeElement)
    return this
  }
  cancelActiveElement() {
    if (!this.hasActiveElement()) {
      return this
    }
    this.activeElement.isActive = false
    this.activeElement = null
    this.app.emit('activeElementChange', this.activeElement)
    return this
  }
  checkIsHitElement(e) {
    let x = e.unGridClientX
    let y = e.unGridClientY
    for (let i = this.elementList.length - 1; i >= 0; i--) {
      let element = this.elementList[i]
      if (element.isHit(x, y)) {
        return element
      }
    }
    return null
  }
  pureCreateElement(opts = {}) {
    switch (opts.type) {
      case 'rectangle':
        return new Rectangle(opts, this.app)
      case 'diamond':
        return new Diamond(opts, this.app)
      case 'triangle':
        return new Triangle(opts, this.app)
      case 'circle':
        return new Circle(opts, this.app)
      case 'freedraw':
        return new Freedraw(opts, this.app)
      case 'image':
        return new Image$1(opts, this.app)
      case 'arrow':
        return new Arrow(opts, this.app)
      case 'line':
        return new Line(opts, this.app)
      case 'text':
        return new Text(opts, this.app)
      default:
        return null
    }
  }
  createElement(opts = {}, callback = () => {}, ctx = null, notActive) {
    if (this.hasActiveElement() || this.isCreatingElement) {
      return this
    }
    let element = this.pureCreateElement(opts)
    if (!element) {
      return this
    }
    this.addElement(element)
    if (!notActive) {
      this.setActiveElement(element)
    }
    this.isCreatingElement = true
    callback.call(ctx, element)
    return this
  }
  copyElement(element, notActive = false, pos) {
    return new Promise(resolve =>
      __async(this, null, function* () {
        if (!element) {
          return resolve()
        }
        let data = this.app.group.handleCopyElementData(element.serialize())
        if (data.type === 'image') {
          data.imageObj = yield createImageObj(data.url)
        }
        this.createElement(
          data,
          element2 => {
            this.app.group.handleCopyElement(element2)
            element2.startResize(DRAG_ELEMENT_PARTS.BODY)
            let ox = 20
            let oy = 20
            if (pos) {
              ox = pos.x - element2.x - element2.width / 2
              oy = pos.y - element2.y - element2.height / 2
            }
            let gridAdsorbentPos = this.app.coordinate.gridAdsorbent(ox, oy)
            element2.resize(
              null,
              null,
              null,
              gridAdsorbentPos.x,
              gridAdsorbentPos.y
            )
            element2.isCreating = false
            if (notActive) {
              element2.isActive = false
            }
            this.isCreatingElement = false
            resolve(element2)
          },
          this,
          notActive
        )
      })
    )
  }
  creatingRectangleLikeElement(type, x, y, offsetX, offsetY) {
    this.createElement({
      type,
      x,
      y,
      width: offsetX,
      height: offsetY
    })
    this.activeElement.updateSize(offsetX, offsetY)
  }
  creatingCircle(x, y, e) {
    this.createElement({
      type: 'circle',
      x,
      y
    })
    let radius = getTowPointDistance(e.clientX, e.clientY, x, y)
    this.activeElement.updateSize(radius, radius)
  }
  creatingFreedraw(e, event) {
    this.createElement({
      type: 'freedraw'
    })
    let element = this.activeElement
    let lineWidth = computedLineWidthBySpeed(
      event.mouseSpeed,
      element.lastLineWidth
    )
    element.lastLineWidth = lineWidth
    element.addPoint(e.clientX, e.clientY, lineWidth)
    let { coordinate, ctx, state } = this.app
    let tfp = coordinate.transformToCanvasCoordinate(
      coordinate.subScrollX(event.lastMousePos.x),
      coordinate.subScrollY(event.lastMousePos.y)
    )
    let ttp = coordinate.transformToCanvasCoordinate(
      coordinate.subScrollX(e.clientX),
      coordinate.subScrollY(e.clientY)
    )
    ctx.save()
    ctx.scale(state.scale, state.scale)
    element.singleRender(tfp.x, tfp.y, ttp.x, ttp.y, lineWidth)
    ctx.restore()
  }
  creatingImage(e, { width, height, imageObj, url, ratio }) {
    let gp = this.app.coordinate.gridAdsorbent(
      e.unGridClientX - width / 2,
      e.unGridClientY - height / 2
    )
    this.createElement({
      type: 'image',
      x: gp.x,
      y: gp.y,
      url,
      imageObj,
      width,
      height,
      ratio
    })
  }
  editingText(element) {
    if (element.type !== 'text') {
      return
    }
    element.noRender = true
    this.setActiveElement(element)
  }
  completeEditingText() {
    let element = this.activeElement
    if (!element || element.type !== 'text') {
      return
    }
    if (!element.text.trim()) {
      this.deleteElement(element)
      this.setActiveElement(null)
      return
    }
    element.noRender = false
  }
  completeCreateArrow(e) {
    this.activeElement.addPoint(e.clientX, e.clientY)
  }
  creatingArrow(x, y, e) {
    this.createElement(
      {
        type: 'arrow',
        x,
        y
      },
      element => {
        element.addPoint(x, y)
      }
    )
    this.activeElement.updateFictitiousPoint(e.clientX, e.clientY)
  }
  creatingLine(x, y, e, isSingle = false, notCreate = false) {
    if (!notCreate) {
      this.createElement(
        {
          type: 'line',
          x,
          y,
          isSingle
        },
        element2 => {
          element2.addPoint(x, y)
        }
      )
    }
    let element = this.activeElement
    if (element) {
      element.updateFictitiousPoint(e.clientX, e.clientY)
    }
  }
  completeCreateLine(e, completeCallback = () => {}) {
    let element = this.activeElement
    let x = e.clientX
    let y = e.clientY
    if (element && element.isSingle) {
      element.addPoint(x, y)
      completeCallback()
    } else {
      this.createElement({
        type: 'line',
        isSingle: false
      })
      element = this.activeElement
      element.addPoint(x, y)
      element.updateFictitiousPoint(x, y)
    }
  }
  completeCreateElement() {
    this.isCreatingElement = false
    let element = this.activeElement
    if (!element) {
      return this
    }
    if (['freedraw', 'arrow', 'line'].includes(element.type)) {
      element.updateMultiPointBoundingRect()
    }
    element.isCreating = false
    this.app.emitChange()
    return this
  }
  setActiveElementStyle(style = {}) {
    if (!this.hasActiveElement()) {
      return this
    }
    Object.keys(style).forEach(key => {
      this.activeElement.style[key] = style[key]
    })
    return this
  }
  checkInResizeHand(x, y) {
    let element = this.activeElement
    let hand = element.dragElement.checkPointInDragElementWhere(x, y)
    if (hand) {
      return {
        element,
        hand
      }
    }
    return null
  }
  checkIsResize(x, y, e) {
    if (!this.hasActiveElement()) {
      return false
    }
    let res = this.checkInResizeHand(x, y)
    if (res) {
      this.isResizing = true
      this.resizingElement = res.element
      this.resizingElement.startResize(res.hand, e)
      this.app.cursor.setResize(res.hand)
      return true
    }
    return false
  }
  handleResize(...args) {
    if (!this.isResizing) {
      return
    }
    this.resizingElement.resize(...args)
  }
  endResize() {
    this.isResizing = false
    this.resizingElement.endResize()
    this.resizingElement = null
  }
}
let getRandomValues
const rnds8 = new Uint8Array(16)
function rng() {
  if (!getRandomValues) {
    getRandomValues =
      typeof crypto !== 'undefined' &&
      crypto.getRandomValues &&
      crypto.getRandomValues.bind(crypto)
    if (!getRandomValues) {
      throw new Error(
        'crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported'
      )
    }
  }
  return getRandomValues(rnds8)
}
const byteToHex = []
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1))
}
function unsafeStringify(arr, offset = 0) {
  return (
    byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    '-' +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    '-' +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    '-' +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    '-' +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase()
}
const randomUUID =
  typeof crypto !== 'undefined' &&
  crypto.randomUUID &&
  crypto.randomUUID.bind(crypto)
var native = {
  randomUUID
}
function v4(options, buf, offset) {
  if (native.randomUUID && !buf && !options) {
    return native.randomUUID()
  }
  options = options || {}
  const rnds = options.random || (options.rng || rng)()
  rnds[6] = (rnds[6] & 15) | 64
  rnds[8] = (rnds[8] & 63) | 128
  if (buf) {
    offset = offset || 0
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i]
    }
    return buf
  }
  return unsafeStringify(rnds)
}
class Group {
  constructor(app) {
    this.app = app
    this.groupIdToElementList = {}
    this.newGroupIdMap = {}
  }
  setToMap(element) {
    let groupId = element.getGroupId()
    if (groupId) {
      if (!this.groupIdToElementList[groupId]) {
        this.groupIdToElementList[groupId] = []
      }
      this.groupIdToElementList[groupId].push(element)
    }
  }
  initIdToElementList(elementList) {
    this.groupIdToElementList = {}
    elementList.forEach(element => {
      this.setToMap(element)
    })
  }
  handleCopyElementData(data) {
    if (data.groupId) {
      if (this.newGroupIdMap[data.groupId]) {
        data.groupId = this.newGroupIdMap[data.groupId]
      } else {
        data.groupId = this.newGroupIdMap[data.groupId] = v4()
      }
    }
    return data
  }
  clearCopyMap() {
    this.newGroupIdMap = {}
  }
  handleCopyElement(element) {
    this.setToMap(element)
  }
  dogroup() {
    if (
      !this.app.selection.hasSelection ||
      this.app.selection.multiSelectElement.selectedElementList.length <= 1
    ) {
      return
    }
    let groupElement = this.app.selection.multiSelectElement.selectedElementList
    let groupId = v4()
    this.groupIdToElementList[groupId] = groupElement
    groupElement.forEach(element => {
      element.setGroupId(groupId)
    })
    this.app.render.render()
    this.app.emitChange()
  }
  ungroup() {
    if (
      !this.app.selection.hasSelection ||
      this.app.selection.multiSelectElement.selectedElementList.length <= 1
    ) {
      return
    }
    let groupElement = this.app.selection.multiSelectElement.selectedElementList
    let groupId = groupElement[0].getGroupId()
    this.groupIdToElementList[groupId] = []
    delete this.groupIdToElementList[groupId]
    groupElement.forEach(element => {
      element.removeGroupId(groupId)
    })
    this.app.render.render()
    this.app.emitChange()
  }
  setSelection(element) {
    let groupId = element.getGroupId()
    if (this.groupIdToElementList[groupId]) {
      this.app.selection.selectElements(this.groupIdToElementList[groupId])
    }
  }
}
class TinyWhiteboard extends EventEmitter {
  constructor(opts = {}) {
    super()
    this.opts = opts
    this.container = opts.container
    this.drawType = opts.drawType || 'selection'
    if (!this.container) {
      throw new Error('\u7F3A\u5C11 container \u53C2\u6570\uFF01')
    }
    if (
      !['absolute', 'fixed', 'relative'].includes(
        window.getComputedStyle(this.container).position
      )
    ) {
      throw new Error(
        'container\u5143\u7D20\u9700\u8981\u8BBE\u7F6E\u5B9A\u4F4D\uFF01'
      )
    }
    this.width = 0
    this.height = 0
    this.left = 0
    this.top = 0
    this.canvas = null
    this.ctx = null
    this.state = __spreadValues(
      {
        scale: 1,
        scrollX: 0,
        scrollY: 0,
        scrollStep: 50,
        backgroundColor: '',
        showGrid: false,
        readonly: false,
        gridConfig: {
          size: 20,
          strokeStyle: '#dfe0e1',
          lineWidth: 1
        }
      },
      opts.state || {}
    )
    this.initCanvas()
    this.coordinate = new Coordinate(this)
    this.event = new Event(this)
    this.event.on('mousedown', this.onMousedown, this)
    this.event.on('mousemove', this.onMousemove, this)
    this.event.on('mouseup', this.onMouseup, this)
    this.event.on('dblclick', this.onDblclick, this)
    this.event.on('mousewheel', this.onMousewheel, this)
    this.event.on('contextmenu', this.onContextmenu, this)
    this.keyCommand = new KeyCommand(this)
    this.imageEdit = new ImageEdit(this)
    this.imageEdit.on('imageSelectChange', this.onImageSelectChange, this)
    this.textEdit = new TextEdit(this)
    this.textEdit.on('blur', this.onTextInputBlur, this)
    this.cursor = new Cursor(this)
    this.history = new History(this)
    this.export = new Export(this)
    this.background = new Background(this)
    this.selection = new Selection(this)
    this.group = new Group(this)
    this.grid = new Grid(this)
    this.mode = new Mode(this)
    this.elements = new Elements$1(this)
    this.render = new Render(this)
    this.proxy()
    this.checkIsOnElement = throttle(this.checkIsOnElement, this)
    this.emitChange()
    this.helpUpdate()
  }
  proxy() {
    ;['undo', 'redo'].forEach(method => {
      this[method] = this.history[method].bind(this.history)
    })
    ;[].forEach(method => {
      this[method] = this.elements[method].bind(this.elements)
    })
    ;[
      'deleteElement',
      'setActiveElementStyle',
      'setCurrentElementsStyle',
      'cancelActiveElement',
      'deleteActiveElement',
      'deleteCurrentElements',
      'empty',
      'zoomIn',
      'zoomOut',
      'setZoom',
      'scrollTo',
      'scrollToCenter',
      'copyPasteCurrentElements',
      'setBackgroundColor',
      'copyElement',
      'copyCurrentElement',
      'cutCurrentElement',
      'pasteCurrentElement',
      'updateActiveElementRotate',
      'updateActiveElementSize',
      'updateActiveElementPosition',
      'moveBottomCurrentElement',
      'moveTopCurrentElement',
      'moveUpCurrentElement',
      'moveDownCurrentElement',
      'selectAll',
      'fit'
    ].forEach(method => {
      this[method] = this.render[method].bind(this.render)
    })
    ;['exportImage', 'exportJson'].forEach(method => {
      this[method] = this.export[method].bind(this.export)
    })
    ;['setSelectedElementStyle'].forEach(method => {
      this[method] = this.selection[method].bind(this.selection)
    })
    ;['dogroup', 'ungroup'].forEach(method => {
      this[method] = this.group[method].bind(this.group)
    })
    ;['showGrid', 'hideGrid', 'updateGrid'].forEach(method => {
      this[method] = this.grid[method].bind(this.grid)
    })
    ;['setEditMode', 'setReadonlyMode'].forEach(method => {
      this[method] = this.mode[method].bind(this.mode)
    })
  }
  getContainerRectInfo() {
    let { width, height, left, top } = this.container.getBoundingClientRect()
    this.width = width
    this.height = height
    this.left = left
    this.top = top
  }
  helpUpdate() {
    this.background.set()
    if (this.state.showGrid) {
      this.grid.showGrid()
    }
    if (this.state.readonly) {
      this.setReadonlyMode()
    }
  }
  setData(_0, _1) {
    return __async(
      this,
      arguments,
      function* ({ state = {}, elements = [] }, noEmitChange) {
        this.state = state
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].type === 'image') {
            elements[i].imageObj = yield createImageObj(elements[i].url)
          }
        }
        this.helpUpdate()
        this.elements.deleteAllElements().createElementsFromData(elements)
        this.render.render()
        if (!noEmitChange) {
          this.emitChange()
        }
      }
    )
  }
  initCanvas() {
    this.getContainerRectInfo()
    if (this.canvas) {
      this.container.removeChild(this.canvas)
    }
    let { canvas, ctx } = createCanvas(this.width, this.height, {
      className: 'main'
    })
    this.canvas = canvas
    this.ctx = ctx
    this.container.appendChild(this.canvas)
  }
  resize() {
    this.initCanvas()
    this.render.render()
    this.selection.init()
    this.grid.init()
    this.grid.renderGrid()
  }
  updateState(data = {}) {
    this.state = __spreadValues(__spreadValues({}, this.state), data)
    this.emitChange()
  }
  updateCurrentType(drawType) {
    this.drawType = drawType
    if (this.drawType === 'image') {
      this.imageEdit.selectImage()
    }
    if (this.drawType === 'eraser') {
      this.cursor.setEraser()
      this.cancelActiveElement()
    } else if (this.drawType !== 'selection') {
      this.cursor.setCrosshair()
    } else {
      this.cursor.reset()
    }
    this.emit('currentTypeChange', this.drawType)
  }
  getData() {
    return {
      state: __spreadValues({}, this.state),
      elements: this.elements.serialize()
    }
  }
  onImageSelectChange() {
    this.cursor.hide()
  }
  onMousedown(e, event) {
    if (this.state.readonly || this.mode.isDragMode) {
      this.mode.onStart()
      return
    }
    if (!this.elements.isCreatingElement && !this.textEdit.isEditing) {
      let hitElement = this.elements.checkIsHitElement(e)
      if (this.drawType === 'selection') {
        if (this.elements.hasActiveElement()) {
          let isResizing = this.elements.checkIsResize(
            event.mousedownPos.unGridClientX,
            event.mousedownPos.unGridClientY,
            e
          )
          if (!isResizing) {
            this.elements.setActiveElement(hitElement)
            this.render.render()
          }
        } else {
          if (this.selection.hasSelection) {
            let isResizing = this.selection.checkIsResize(
              event.mousedownPos.unGridClientX,
              event.mousedownPos.unGridClientY,
              e
            )
            if (!isResizing) {
              this.selection.reset()
              this.elements.setActiveElement(hitElement)
              this.render.render()
            }
          } else if (hitElement) {
            if (hitElement.hasGroup()) {
              this.group.setSelection(hitElement)
              this.onMousedown(e, event)
            } else {
              this.elements.setActiveElement(hitElement)
              this.render.render()
              this.onMousedown(e, event)
            }
          } else {
            this.selection.onMousedown(e, event)
          }
        }
      } else if (this.drawType === 'eraser') {
        this.deleteElement(hitElement)
      }
    }
  }
  onMousemove(e, event) {
    if (this.state.readonly || this.mode.isDragMode) {
      if (event.isMousedown) {
        this.mode.onMove(e, event)
      }
      return
    }
    if (event.isMousedown) {
      let mx = event.mousedownPos.x
      let my = event.mousedownPos.y
      let offsetX = Math.max(event.mouseOffset.x, 0)
      let offsetY = Math.max(event.mouseOffset.y, 0)
      if (this.drawType === 'selection') {
        if (this.selection.isResizing) {
          this.selection.handleResize(
            e,
            mx,
            my,
            event.mouseOffset.x,
            event.mouseOffset.y
          )
        } else if (this.selection.creatingSelection) {
          this.selection.onMousemove(e, event)
        } else {
          this.elements.handleResize(
            e,
            mx,
            my,
            event.mouseOffset.x,
            event.mouseOffset.y
          )
          this.render.render()
        }
      } else if (['rectangle', 'diamond', 'triangle'].includes(this.drawType)) {
        this.elements.creatingRectangleLikeElement(
          this.drawType,
          mx,
          my,
          offsetX,
          offsetY
        )
        this.render.render()
      } else if (this.drawType === 'circle') {
        this.elements.creatingCircle(mx, my, e)
        this.render.render()
      } else if (this.drawType === 'freedraw') {
        this.elements.creatingFreedraw(e, event)
      } else if (this.drawType === 'arrow') {
        this.elements.creatingArrow(mx, my, e)
        this.render.render()
      } else if (this.drawType === 'line') {
        if (getTowPointDistance(mx, my, e.clientX, e.clientY) > 3) {
          this.elements.creatingLine(mx, my, e, true)
          this.render.render()
        }
      }
    } else {
      if (this.imageEdit.isReady) {
        this.cursor.hide()
        this.imageEdit.updatePreviewElPos(
          e.originEvent.clientX,
          e.originEvent.clientY
        )
      } else if (this.drawType === 'selection') {
        if (this.elements.hasActiveElement()) {
          let handData = ''
          if (
            (handData = this.elements.checkInResizeHand(
              e.unGridClientX,
              e.unGridClientY
            ))
          ) {
            this.cursor.setResize(handData.hand)
          } else {
            this.checkIsOnElement(e)
          }
        } else if (this.selection.hasSelection) {
          let hand = this.selection.checkInResizeHand(
            e.unGridClientX,
            e.unGridClientY
          )
          if (hand) {
            this.cursor.setResize(hand)
          } else {
            this.checkIsOnElement(e)
          }
        } else {
          this.checkIsOnElement(e)
        }
      } else if (this.drawType === 'line') {
        this.elements.creatingLine(null, null, e, false, true)
        this.render.render()
      }
    }
  }
  checkIsOnElement(e) {
    let hitElement = this.elements.checkIsHitElement(e)
    if (hitElement) {
      this.cursor.setMove()
    } else {
      this.cursor.reset()
    }
  }
  resetCurrentType() {
    if (this.drawType !== 'selection') {
      this.drawType = 'selection'
      this.emit('currentTypeChange', 'selection')
    }
  }
  completeCreateNewElement() {
    this.resetCurrentType()
    this.elements.completeCreateElement()
    this.render.render()
  }
  onMouseup(e) {
    if (this.state.readonly || this.mode.isDragMode) {
      return
    }
    if (this.drawType === 'text') {
      if (!this.textEdit.isEditing) {
        this.createTextElement(e)
        this.resetCurrentType()
      }
    } else if (this.imageEdit.isReady) {
      this.elements.creatingImage(e, this.imageEdit.imageData)
      this.completeCreateNewElement()
      this.cursor.reset()
      this.imageEdit.reset()
    } else if (this.drawType === 'arrow') {
      this.elements.completeCreateArrow(e)
      this.completeCreateNewElement()
    } else if (this.drawType === 'line') {
      this.elements.completeCreateLine(e, () => {
        this.completeCreateNewElement()
      })
      this.render.render()
    } else if (this.elements.isCreatingElement) {
      if (this.drawType === 'freedraw') {
        this.elements.completeCreateElement()
        this.elements.setActiveElement()
      } else {
        this.completeCreateNewElement()
      }
    } else if (this.elements.isResizing) {
      this.elements.endResize()
      this.emitChange()
    } else if (this.selection.creatingSelection) {
      this.selection.onMouseup(e)
    } else if (this.selection.isResizing) {
      this.selection.endResize()
      this.emitChange()
    }
  }
  onDblclick(e) {
    if (this.drawType === 'line') {
      this.completeCreateNewElement()
    } else {
      let hitElement = this.elements.checkIsHitElement(e)
      if (hitElement) {
        if (hitElement.type === 'text') {
          this.elements.editingText(hitElement)
          this.render.render()
          this.keyCommand.unBindEvent()
          this.textEdit.showTextEdit()
        }
      } else {
        if (!this.textEdit.isEditing) {
          this.createTextElement(e)
        }
      }
    }
  }
  onTextInputBlur() {
    this.keyCommand.bindEvent()
    this.elements.completeEditingText()
    this.render.render()
    this.emitChange()
  }
  createTextElement(e) {
    this.elements.createElement({
      type: 'text',
      x: e.clientX,
      y: e.clientY
    })
    this.keyCommand.unBindEvent()
    this.textEdit.showTextEdit()
  }
  onMousewheel(dir) {
    let stepNum = this.state.scrollStep / this.state.scale
    let step = dir === 'down' ? stepNum : -stepNum
    this.scrollTo(this.state.scrollX, this.state.scrollY + step)
  }
  onContextmenu(e) {
    let elements = []
    if (this.elements.hasActiveElement()) {
      elements = [this.elements.activeElement]
    } else if (this.selection.hasSelectionElements()) {
      elements = this.selection.getSelectionElements()
    }
    this.emit('contextmenu', e.originEvent, elements)
  }
  emitChange() {
    let data = this.getData()
    this.history.add(data)
    this.emit('change', data)
  }
}
TinyWhiteboard.utils = utils
TinyWhiteboard.checkHit = checkHit
TinyWhiteboard.draw = draw
TinyWhiteboard.elements = Elements
export { TinyWhiteboard as default }
