import {
  getTowPointDistance,
  transformPointOnElement,
  checkPointIsInRectangle,
  getTowPointRotate,
  getElementCenterPoint,
  transformPointReverseRotate,
  getElementRotatedCornerPoint,
  getRotatedPoint
} from '../utils'
import { CORNERS, DRAG_ELEMENT_PARTS } from '../constants'
import BaseElement from './BaseElement'
import { drawRect, drawCircle } from '../utils/draw'

// 拖拽元素
export default class DragElement extends BaseElement {
  constructor(element, app, opts = {}) {
    super(
      {
        type: 'dragElement',
        notNeedDragElement: true
      },
      app
    )

    this.opts = {
      // 是否锁定长宽比
      lockRatio: false,
      ...opts
    }

    // 样式
    this.style = {
      strokeStyle: '#666', // 线条颜色
      fillStyle: 'transparent', // 填充颜色
      lineWidth: 'small', // 线条宽度
      lineDash: 0, // 线条虚线大小
      globalAlpha: 1 // 透明度
    }

    // 归属节点
    this.element = element

    // 和元素的距离
    this.offset = 5
    // 拖拽手柄尺寸
    this.size = 10

    // 当前正在进行何种调整操作
    this.resizeType = ''
    // 当前鼠标按住拖拽元素的点的对角点
    this.diagonalPoint = {
      x: 0,
      y: 0
    }
    // 当前鼠标按下时的坐标和拖拽元素的点的坐标差值
    this.mousedownPosAndElementPosOffset = {
      x: 0,
      y: 0
    }
    // 元素的长宽比
    this.elementRatio = 0
    // 隐藏的部分
    this.hideParts = []
  }

  // 设置隐藏的部分
  setHideParts(parts = []) {
    this.hideParts = parts
  }

  // 显示所有部分
  showAll() {
    this.setHideParts([])
  }

  // 只显示主体部分
  onlyShowBody() {
    this.setHideParts([
      DRAG_ELEMENT_PARTS.ROTATE,
      DRAG_ELEMENT_PARTS.TOP_LEFT_BTN,
      DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN,
      DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN,
      DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN
    ])
  }

  // 更新数据
  update() {
    this.x = this.element.x - this.offset
    this.y = this.element.y - this.offset
    this.width = this.element.width + this.offset * 2
    this.height = this.element.height + this.offset * 2
    this.rotate = this.element.rotate
  }

  // 渲染
  render() {
    // 如果被编组了那么不显示组元素自身的拖拽框
    if (this.element.hasGroup()) return
    this.update()
    let { width, height } = this
    this.warpRender(({ halfWidth, halfHeight }) => {
      // 主体
      this.app.ctx.save()
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.BODY)) {
        this.app.ctx.setLineDash([5])
        drawRect(this.app.ctx, -halfWidth, -halfHeight, width, height)
        this.app.ctx.restore()
      }
      // 左上角
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.TOP_LEFT_BTN)) {
        drawRect(
          this.app.ctx,
          -halfWidth - this.size,
          -halfHeight - this.size,
          this.size,
          this.size
        )
      }
      // 右上角
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN)) {
        drawRect(
          this.app.ctx,
          -halfWidth + this.element.width + this.size,
          -halfHeight - this.size,
          this.size,
          this.size
        )
      }
      // 右下角
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN)) {
        drawRect(
          this.app.ctx,
          -halfWidth + this.element.width + this.size,
          -halfHeight + this.element.height + this.size,
          this.size,
          this.size
        )
      }
      // 左下角
      if (!this.hideParts.includes(DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN)) {
        drawRect(
          this.app.ctx,
          -halfWidth - this.size,
          -halfHeight + this.element.height + this.size,
          this.size,
          this.size
        )
      }
      // 旋转按钮
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

  // 检测一个坐标在拖拽元素的哪个部分上
  checkPointInDragElementWhere(x, y) {
    let part = ''
    // 坐标反向旋转元素的角度
    let rp = transformPointOnElement(x, y, this.element)
    // 在内部
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
      // 在旋转按钮
      part = DRAG_ELEMENT_PARTS.ROTATE
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.TOP_LEFT)) {
      // 在左上角伸缩手柄
      part = DRAG_ELEMENT_PARTS.TOP_LEFT_BTN
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.TOP_RIGHT)) {
      // 在右上角伸缩手柄
      part = DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.BOTTOM_RIGHT)) {
      // 在右下角伸缩手柄
      part = DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.BOTTOM_LEFT)) {
      // 在左下角伸缩手柄
      part = DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN
    }
    if (this.hideParts.includes(part)) {
      part = ''
    }
    return part
  }

  // 检测坐标是否在某个拖拽按钮内
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
      default:
        break
    }
    return checkPointIsInRectangle(x, y, _x, _y, this.size, this.size)
  }

  // 开始调整元素
  startResize(resizeType, e) {
    this.resizeType = resizeType
    if (this.opts.lockRatio) {
      this.elementRatio = this.element.width / this.element.height
    }
    if (resizeType === DRAG_ELEMENT_PARTS.BODY) {
      // 按住了拖拽元素内部
      this.element.saveState()
    } else if (resizeType === DRAG_ELEMENT_PARTS.ROTATE) {
      // 按住了拖拽元素的旋转按钮
      this.element.saveState()
    } else if (resizeType === DRAG_ELEMENT_PARTS.TOP_LEFT_BTN) {
      // 按住了拖拽元素左上角拖拽手柄
      this.handleDragMousedown(e, CORNERS.TOP_LEFT)
    } else if (resizeType === DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN) {
      // 按住了拖拽元素右上角拖拽手柄
      this.handleDragMousedown(e, CORNERS.TOP_RIGHT)
    } else if (resizeType === DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN) {
      // 按住了拖拽元素右下角拖拽手柄
      this.handleDragMousedown(e, CORNERS.BOTTOM_RIGHT)
    } else if (resizeType === DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN) {
      // 按住了拖拽元素左下角拖拽手柄
      this.handleDragMousedown(e, CORNERS.BOTTOM_LEFT)
    }
  }

  // 结束调整元素操作
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

  // 处理按下拖拽元素四个伸缩手柄事件
  handleDragMousedown(e, corner) {
    let centerPos = getElementCenterPoint(this.element)
    let pos = getElementRotatedCornerPoint(this.element, corner)
    // 对角点的坐标
    this.diagonalPoint.x = 2 * centerPos.x - pos.x
    this.diagonalPoint.y = 2 * centerPos.y - pos.y
    // 鼠标按下位置和元素的左上角坐标差值
    this.mousedownPosAndElementPosOffset.x = e.clientX - pos.x
    this.mousedownPosAndElementPosOffset.y = e.clientY - pos.y
    this.element.saveState()
  }

  // 调整元素
  handleResizeElement(e, mx, my, offsetX, offsetY) {
    let resizeType = this.resizeType
    // 按住了拖拽元素内部
    if (resizeType === DRAG_ELEMENT_PARTS.BODY) {
      this.handleMoveElement(offsetX, offsetY)
    } else if (resizeType === DRAG_ELEMENT_PARTS.ROTATE) {
      // 按住了拖拽元素的旋转按钮
      this.handleRotateElement(e, mx, my)
    } else if (resizeType === DRAG_ELEMENT_PARTS.TOP_LEFT_BTN) {
      // 按住左上角伸缩元素
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
      // 按住右上角伸缩元素
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
      // 按住右下角伸缩元素
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
      // 按住左下角伸缩元素
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

  // 移动元素整体
  handleMoveElement(offsetX, offsetY) {
    this.element.move(offsetX, offsetY)
  }

  // 旋转元素
  handleRotateElement(e, mx, my) {
    // 获取元素中心点
    let centerPos = getElementCenterPoint(this.element)
    // 获取鼠标移动的角度
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

  // 伸缩计算
  stretchCalc(x, y, calcSize, calcPos) {
    // 新的中心点
    let newCenter = {
      x: (x + this.diagonalPoint.x) / 2,
      y: (y + this.diagonalPoint.y) / 2
    }
    // 获取当前鼠标位置经新的中心点反向旋转元素的角度后的坐标
    let rp = transformPointReverseRotate(
      x,
      y,
      newCenter.x,
      newCenter.y,
      this.element.rotate
    )
    // 计算新尺寸
    let newSize = calcSize(newCenter, rp)
    // 判断是否翻转了，不允许翻转
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
    // 计算新位置
    let newPos = calcPos(rp, newSize)
    let newRect = {
      x: newPos.x,
      y: newPos.y,
      width: newSize.width,
      height: newSize.height
    }
    // 如果翻转了，那么位置保持为上一次的位置
    if (isWidthReverse || isHeightReverse) {
      newRect.x = this.element.x
      newRect.y = this.element.y
    }
    return {
      newRect,
      newCenter
    }
  }

  // 伸缩元素
  handleStretchElement(e, calcSize, calcPos, fixPos) {
    let actClientX = e.clientX - this.mousedownPosAndElementPosOffset.x
    let actClientY = e.clientY - this.mousedownPosAndElementPosOffset.y
    let { newRect, newCenter } = this.stretchCalc(
      actClientX,
      actClientY,
      calcSize,
      calcPos
    )
    // 修正新图形
    if (this.opts.lockRatio) {
      this.fixStretch(newRect, newCenter, calcSize, calcPos, fixPos)
      return
    }
    // 更新尺寸位置信息
    this.element.updateRect(newRect.x, newRect.y, newRect.width, newRect.height)
  }

  // 锁定长宽比时修正新图形
  fixStretch(newRect, newCenter, calcSize, calcPos, fixPos) {
    let newRatio = newRect.width / newRect.height
    let fp = fixPos(newRatio, newRect)
    // 修正的点旋转图形的角度
    let rp = getRotatedPoint(
      fp.x,
      fp.y,
      newCenter.x,
      newCenter.y,
      this.element.rotate
    )
    let fixNewRect = this.stretchCalc(rp.x, rp.y, calcSize, calcPos).newRect
    // 不知道为什么刚拖动时会有宽高计算为0的情况
    if (fixNewRect.width === 0 && fixNewRect.height === 0) {
      return
    }
    // 更新尺寸位置信息
    this.element.updateRect(
      fixNewRect.x,
      fixNewRect.y,
      fixNewRect.width,
      fixNewRect.height
    )
  }
}
