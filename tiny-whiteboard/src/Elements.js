import Rectangle from './elements/Rectangle'
import Circle from './elements/Circle'
import Diamond from './elements/Diamond'
import Triangle from './elements/Triangle'
import Freedraw from './elements/Freedraw'
import Arrow from './elements/Arrow'
import Image from './elements/Image'
import Line from './elements/Line'
import Text from './elements/Text'
import {
  getTowPointDistance,
  throttle,
  computedLineWidthBySpeed,
  createImageObj
} from './utils'
import { DRAG_ELEMENT_PARTS } from './constants'

// 元素管理类
export default class Elements {
  constructor(app) {
    this.app = app
    // 所有元素
    this.elementList = []
    // 当前激活元素
    this.activeElement = null
    // 当前正在创建新元素
    this.isCreatingElement = false
    // 当前正在调整元素
    this.isResizing = false
    // 当前正在调整的元素
    this.resizingElement = null
    // 稍微缓解一下卡顿
    this.handleResize = throttle(this.handleResize, this, 16)
  }

  // 序列化当前画布上的所有元素
  serialize(stringify = false) {
    let data = this.elementList.map(element => {
      return element.serialize()
    })
    return stringify ? JSON.stringify(data) : data
  }

  // 获取当前画布上的元素数量
  getElementsNum() {
    return this.elementList.length
  }

  // 当前画布上是否有元素
  hasElements() {
    return this.elementList.length > 0
  }

  // 添加元素
  addElement(element) {
    this.elementList.push(element)
    return this
  }

  // 向前添加元素
  unshiftElement(element) {
    this.elementList.unshift(element)
    return this
  }

  // 添加元素到指定位置
  insertElement(element, index) {
    this.elementList.splice(index, 0, element)
  }

  // 删除元素
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

  // 删除全部元素
  deleteAllElements() {
    this.activeElement = null
    this.elementList = []
    this.isCreatingElement = false
    this.isResizing = false
    this.resizingElement = null
    return this
  }

  // 获取元素在元素列表里的索引
  getElementIndex(element) {
    return this.elementList.findIndex(item => {
      return item === element
    })
  }

  // 根据元素数据创建元素
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

  // 是否存在激活元素
  hasActiveElement() {
    return !!this.activeElement
  }

  // 设置激活元素
  setActiveElement(element) {
    this.cancelActiveElement()
    this.activeElement = element
    if (element) {
      element.isActive = true
    }
    this.app.emit('activeElementChange', this.activeElement)
    return this
  }

  // 取消当前激活元素
  cancelActiveElement() {
    if (!this.hasActiveElement()) {
      return this
    }
    this.activeElement.isActive = false
    this.activeElement = null
    this.app.emit('activeElementChange', this.activeElement)
    return this
  }

  // 检测是否点击选中元素
  checkIsHitElement(e) {
    // 判断是否选中元素
    let x = e.unGridClientX
    let y = e.unGridClientY
    // 从后往前遍历元素，默认认为新创建的元素在上一层
    for (let i = this.elementList.length - 1; i >= 0; i--) {
      let element = this.elementList[i]
      if (element.isHit(x, y)) {
        return element
      }
    }
    return null
  }

  // 纯创建元素
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
        return new Image(opts, this.app)
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

  // 创建元素
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

  // 复制元素
  copyElement(element, notActive = false, pos) {
    return new Promise(async resolve => {
      if (!element) {
        return resolve()
      }
      let data = this.app.group.handleCopyElementData(element.serialize())
      // 图片元素需要先加载图片
      if (data.type === 'image') {
        data.imageObj = await createImageObj(data.url)
      }
      this.createElement(
        data,
        element => {
          this.app.group.handleCopyElement(element)
          element.startResize(DRAG_ELEMENT_PARTS.BODY)
          // 默认偏移原图形20像素
          let ox = 20
          let oy = 20
          // 指定了具体坐标则使用具体坐标
          if (pos) {
            ox = pos.x - element.x - element.width / 2
            oy = pos.y - element.y - element.height / 2
          }
          // 如果开启了网格，那么要坐标要吸附到网格
          let gridAdsorbentPos = this.app.coordinate.gridAdsorbent(ox, oy)
          element.resize(
            null,
            null,
            null,
            gridAdsorbentPos.x,
            gridAdsorbentPos.y
          )
          element.isCreating = false
          if (notActive) {
            element.isActive = false
          }
          this.isCreatingElement = false
          resolve(element)
        },
        this,
        notActive
      )
    })
  }

  // 正在创建类矩形元素
  creatingRectangleLikeElement(type, x, y, offsetX, offsetY) {
    this.createElement({
      type,
      x: x,
      y: y,
      width: offsetX,
      height: offsetY
    })
    this.activeElement.updateSize(offsetX, offsetY)
  }

  // 正在创建圆形元素
  creatingCircle(x, y, e) {
    this.createElement({
      type: 'circle',
      x: x,
      y: y
    })
    let radius = getTowPointDistance(e.clientX, e.clientY, x, y)
    this.activeElement.updateSize(radius, radius)
  }

  // 正在创建自由画笔元素
  creatingFreedraw(e, event) {
    this.createElement({
      type: 'freedraw'
    })
    let element = this.activeElement
    // 计算画笔粗细
    let lineWidth = computedLineWidthBySpeed(
      event.mouseSpeed,
      element.lastLineWidth
    )
    element.lastLineWidth = lineWidth
    element.addPoint(e.clientX, e.clientY, lineWidth)
    // 绘制自由线不重绘，采用增量绘制，否则会卡顿
    let { coordinate, ctx, state } = this.app
    // 事件对象的坐标默认是加上了画布偏移量的，临时绘制的时候不需要，所以需要减去
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

  // 正在创建图片元素
  creatingImage(e, { width, height, imageObj, url, ratio }) {
    // 吸附到网格，如果网格开启的话
    let gp = this.app.coordinate.gridAdsorbent(
      e.unGridClientX - width / 2,
      e.unGridClientY - height / 2
    )
    this.createElement({
      type: 'image',
      x: gp.x,
      y: gp.y,
      url: url,
      imageObj: imageObj,
      width: width,
      height: height,
      ratio: ratio
    })
  }

  // 正在编辑文本元素
  editingText(element) {
    if (element.type !== 'text') {
      return
    }
    element.noRender = true
    this.setActiveElement(element)
  }

  // 完成文本元素的编辑
  completeEditingText() {
    let element = this.activeElement
    if (!element || element.type !== 'text') {
      return
    }
    if (!element.text.trim()) {
      // 没有输入则删除该文字元素
      this.deleteElement(element)
      this.setActiveElement(null)
      return
    }
    element.noRender = false
  }

  // 完成箭头元素的创建
  completeCreateArrow(e) {
    this.activeElement.addPoint(e.clientX, e.clientY)
  }

  // 正在创建箭头元素
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

  // 正在创建线段/折线元素
  creatingLine(x, y, e, isSingle = false, notCreate = false) {
    if (!notCreate) {
      this.createElement(
        {
          type: 'line',
          x,
          y,
          isSingle
        },
        element => {
          element.addPoint(x, y)
        }
      )
    }
    let element = this.activeElement
    if (element) {
      element.updateFictitiousPoint(e.clientX, e.clientY)
    }
  }

  // 完成线段/折线元素的创建
  completeCreateLine(e, completeCallback = () => {}) {
    let element = this.activeElement
    let x = e.clientX
    let y = e.clientY
    if (element && element.isSingle) {
      // 单根线段模式，鼠标松开则代表绘制完成
      element.addPoint(x, y)
      completeCallback()
    } else {
      // 绘制折线模式，鼠标松开代表固定一个端点
      this.createElement({
        type: 'line',
        isSingle: false
      })
      element = this.activeElement
      element.addPoint(x, y)
      element.updateFictitiousPoint(x, y)
    }
  }

  // 创建元素完成
  completeCreateElement() {
    this.isCreatingElement = false
    let element = this.activeElement
    if (!element) {
      return this
    }
    // 由多个端点构成的元素需要根据端点计算外包围框
    if (['freedraw', 'arrow', 'line'].includes(element.type)) {
      element.updateMultiPointBoundingRect()
    }
    element.isCreating = false
    this.app.emitChange()
    return this
  }

  // 为激活元素设置样式
  setActiveElementStyle(style = {}) {
    if (!this.hasActiveElement()) {
      return this
    }
    Object.keys(style).forEach(key => {
      this.activeElement.style[key] = style[key]
    })
    return this
  }

  // 检测指定位置是否在元素调整手柄上
  checkInResizeHand(x, y) {
    // 按住了拖拽元素的某个部分
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

  // 检查是否需要进行元素调整操作
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

  // 进行元素调整操作
  handleResize(...args) {
    if (!this.isResizing) {
      return
    }
    this.resizingElement.resize(...args)
    this.app.render.render()
  }

  // 结束元素调整操作
  endResize() {
    this.isResizing = false
    this.resizingElement.endResize()
    this.resizingElement = null
  }
}
