import {
  degToRad,
  getRotatedPoint,
  getElementCorners,
  createNodeKey
} from '../utils'
import EventEmitter from 'eventemitter3'

// 基础元素类
export default class BaseElement extends EventEmitter {
  constructor(opts = {}, app) {
    super()
    this.app = app
    // 编组id
    this.groupId = opts.groupId || ''
    // 类型
    this.type = opts.type || ''
    // key
    this.key = createNodeKey()
    // 是否正在创建中
    this.isCreating = true
    // 是否被激活
    this.isActive = true
    // 是否被多选选中
    this.isSelected = false
    // 记录初始位置，用于拖动时
    this.startX = 0
    this.startY = 0
    // 实时位置，该位置为元素的左上角坐标
    this.x = opts.x || 0
    this.y = opts.y || 0
    // 宽高
    this.width = opts.width || 0
    this.height = opts.height || 0
    // 记录初始角度，用于旋转时
    this.startRotate = 0
    // 角度
    this.rotate = opts.rotate || 0
    // 是否不需要渲染
    this.noRender = false
    // 样式
    this.style = {
      strokeStyle: '', // 线条颜色
      fillStyle: '', // 填充颜色
      lineWidth: 'small', // 线条宽度
      lineDash: 0, // 线条虚线大小
      globalAlpha: 1, // 透明度
      ...(opts.style || {})
    }
    // 拖拽元素实例
    this.dragElement = null
  }

  // 序列化
  serialize() {
    return {
      groupId: this.groupId,
      type: this.type,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      rotate: this.rotate,
      style: {
        ...this.style
      }
    }
  }

  // 渲染方法
  render() {
    throw new Error('子类需要实现该方法！')
  }

  // 设置所属编组id
  setGroupId(groupId) {
    this.groupId = groupId
  }

  // 获取所属组id
  getGroupId() {
    return this.groupId
  }

  // 移除所属组id
  removeGroupId() {
    this.groupId = ''
  }

  // 是否存在编组
  hasGroup() {
    return !!this.groupId
  }

  // 渲染拖拽元素
  renderDragElement() {
    if (this.isActive && !this.isCreating) {
      this.dragElement.showAll()
      this.dragElement.render()
    } else if (this.isSelected) {
      // 被多选选中
      this.dragElement.onlyShowBody()
      this.dragElement.render()
    }
  }

  // 处理样式数据
  handleStyle(style) {
    Object.keys(style).forEach(key => {
      // 处理线条宽度
      if (key === 'lineWidth') {
        if (style[key] === 'small') {
          style[key] = 2
        } else if (style[key] === 'middle') {
          style[key] = 4
        } else if (style[key] === 'large') {
          style[key] = 6
        }
      }
      if (style[key] === '') {
        if (
          this.app.state[key] !== undefined &&
          this.app.state[key] !== null &&
          this.app.state[key] !== ''
        ) {
          style[key] = this.app.state[key]
        }
      }
    })
    return style
  }

  // 设置绘图样式
  setStyle(style = {}) {
    let _style = this.handleStyle(style)
    Object.keys(_style).forEach(key => {
      // 处理虚线
      if (key === 'lineDash') {
        if (_style.lineDash > 0) {
          this.app.ctx.setLineDash([_style.lineDash])
        }
      } else if (
        _style[key] !== undefined &&
        _style[key] !== '' &&
        _style[key] !== null
      ) {
        this.app.ctx[key] = _style[key]
      }
    })
    return this
  }

  // 公共渲染操作
  warpRender(renderFn) {
    let { x, y, width, height, rotate, style } = this
    // 坐标转换
    let { x: tx, y: ty } = this.app.coordinate.transform(x, y)
    // 移动画布中点到元素中心，否则旋转时中心点不对
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

  // 保存元素初始状态
  saveState() {
    let { rotate, x, y } = this
    this.startRotate = rotate
    this.startX = x
    this.startY = y
    return this
  }

  // 移动元素
  move(ox, oy) {
    let { startX, startY } = this
    this.x = startX + ox
    this.y = startY + oy
    this.emit('elementPositionChange', this.x, this.y)
    return this
  }

  // 更新元素包围框
  updateRect(x, y, width, height) {
    this.updatePos(x, y)
    this.updateSize(width, height)
    return this
  }

  // 更新激活元素尺寸
  updateSize(width, height) {
    this.width = width
    this.height = height
    this.emit('elementSizeChange', this.width, this.height)
    return this
  }

  // 更新激活元素坐标
  updatePos(x, y) {
    this.x = x
    this.y = y
    this.emit('elementPositionChange', this.x, this.y)
    return this
  }

  // 偏移元素角度
  offsetRotate(or) {
    this.updateRotate(this.startRotate + or)
    return this
  }

  // 更新元素角度
  updateRotate(rotate) {
    rotate = rotate % 360
    if (rotate < 0) {
      rotate = 360 + rotate
    }
    this.rotate = parseInt(rotate)
    this.emit('elementRotateChange', this.rotate)
  }

  // 根据指定中心点旋转元素的各个点
  rotateByCenter(rotate, cx, cy) {
    this.offsetRotate(rotate)
    let np = getRotatedPoint(this.startX, this.startY, cx, cy, rotate)
    this.updatePos(np.x, np.y)
  }

  // 检测元素是否被击中
  isHit(x, y) {
    throw new Error('子类需要实现该方法!')
  }

  // 开始调整元素
  startResize(resizeType, e) {
    this.dragElement.startResize(resizeType, e)
    return this
  }

  // 结束调整元素操作
  endResize() {
    this.dragElement.endResize()
    return this
  }

  // 调整元素中
  resize(...args) {
    this.dragElement.handleResizeElement(...args)
    return this
  }

  // 获取图形应用了旋转之后的端点列表
  getEndpointList() {
    return getElementCorners(this)
  }
}
