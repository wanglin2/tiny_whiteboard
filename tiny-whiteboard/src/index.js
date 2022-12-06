import EventEmitter from 'eventemitter3'
import {
  createCanvas,
  getTowPointDistance,
  throttle,
  createImageObj
} from './utils'
import * as utils from './utils'
import * as checkHit from './utils/checkHit'
import * as draw from './utils/draw'
import Coordinate from './Coordinate'
import Event from './Event'
import Elements from './Elements'
import ImageEdit from './ImageEdit'
import Cursor from './Cursor'
import TextEdit from './TextEdit'
import History from './History'
import Export from './Export'
import Background from './Background'
import Selection from './Selection'
import Grid from './Grid'
import Mode from './Mode'
import KeyCommand from './KeyCommand'
import Render from './Render'
import elements from './elements'
import Group from './Group'

// 主类
class TinyWhiteboard extends EventEmitter {
  constructor(opts = {}) {
    super()
    // 参数
    this.opts = opts
    // 容器元素
    this.container = opts.container
    // 当前绘制类型
    this.drawType = opts.drawType || 'selection'
    // 对容器做一些必要检查
    if (!this.container) {
      throw new Error('缺少 container 参数！')
    }
    if (
      !['absolute', 'fixed', 'relative'].includes(
        window.getComputedStyle(this.container).position
      )
    ) {
      throw new Error('container元素需要设置定位！')
    }
    // 容器宽高位置信息
    this.width = 0
    this.height = 0
    this.left = 0
    this.top = 0
    // 主要的渲染canvas元素
    this.canvas = null
    // canvas绘制上下文
    this.ctx = null
    // 画布状态
    this.state = {
      scale: 1, // 缩放
      scrollX: 0, // 水平方向的滚动偏移量
      scrollY: 0, // 垂直方向的滚动偏移量
      scrollStep: 50, // 滚动步长
      backgroundColor: '', // 背景颜色
      strokeStyle: '#000000', // 默认线条颜色
      fillStyle: 'transparent', // 默认填充颜色
      fontFamily: '微软雅黑, Microsoft YaHei', // 默认文字字体
      fontSize: 18, // 默认文字字号
      dragStrokeStyle: '#666', // 选中元素的拖拽元素的默认线条颜色
      showGrid: false, // 是否显示网格
      readonly: false, // 是否是只读模式
      gridConfig: {
        size: 20, // 网格大小
        strokeStyle: '#dfe0e1', // 网格线条颜色
        lineWidth: 1 // 网格线条宽度
      },
      ...(opts.state || {})
    }

    // 初始化画布
    this.initCanvas()
    // 坐标转换类
    this.coordinate = new Coordinate(this)
    // 事件类
    this.event = new Event(this)
    this.event.on('mousedown', this.onMousedown, this)
    this.event.on('mousemove', this.onMousemove, this)
    this.event.on('mouseup', this.onMouseup, this)
    this.event.on('dblclick', this.onDblclick, this)
    this.event.on('mousewheel', this.onMousewheel, this)
    this.event.on('contextmenu', this.onContextmenu, this)
    // 快捷键类
    this.keyCommand = new KeyCommand(this)
    // 图片选择类
    this.imageEdit = new ImageEdit(this)
    this.imageEdit.on('imageSelectChange', this.onImageSelectChange, this)
    // 文字编辑类
    this.textEdit = new TextEdit(this)
    this.textEdit.on('blur', this.onTextInputBlur, this)
    // 鼠标样式类
    this.cursor = new Cursor(this)
    // 历史记录管理类
    this.history = new History(this)
    // 导入导出类
    this.export = new Export(this)
    // 背景设置类
    this.background = new Background(this)
    // 多选类
    this.selection = new Selection(this)
    // 编组类
    this.group = new Group(this)
    // 网格类
    this.grid = new Grid(this)
    // 模式类
    this.mode = new Mode(this)
    // 元素管理类
    this.elements = new Elements(this)
    // 渲染类
    this.render = new Render(this)

    // 代理
    this.proxy()
    this.checkIsOnElement = throttle(this.checkIsOnElement, this)

    this.emitChange()
    this.helpUpdate()
  }

  // 代理各个类的方法到实例上
  proxy() {
    // history类
    ;['undo', 'redo'].forEach(method => {
      this[method] = this.history[method].bind(this.history)
    })
    // elements类
    ;[].forEach(method => {
      this[method] = this.elements[method].bind(this.elements)
    })
    // 渲染类
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
    // 导入导出类
    ;['exportImage', 'exportJson'].forEach(method => {
      this[method] = this.export[method].bind(this.export)
    })
    // 多选类
    ;['setSelectedElementStyle'].forEach(method => {
      this[method] = this.selection[method].bind(this.selection)
    })
    // 编组类
    ;['dogroup', 'ungroup'].forEach(method => {
      this[method] = this.group[method].bind(this.group)
    })
    // 网格类
    ;['showGrid', 'hideGrid', 'updateGrid'].forEach(method => {
      this[method] = this.grid[method].bind(this.grid)
    })
    // 模式类
    ;['setEditMode', 'setReadonlyMode'].forEach(method => {
      this[method] = this.mode[method].bind(this.mode)
    })
  }

  // 获取容器尺寸位置信息
  getContainerRectInfo() {
    let { width, height, left, top } = this.container.getBoundingClientRect()
    this.width = width
    this.height = height
    this.left = left
    this.top = top
  }

  // 必要的重新渲染
  helpUpdate() {
    // 设置背景
    this.background.set()
    // 设置网格
    if (this.state.showGrid) {
      this.grid.showGrid()
    }
    // 设置模式
    if (this.state.readonly) {
      this.setReadonlyMode()
    }
  }

  // 设置数据，包括状态数据及元素数据
  async setData({ state = {}, elements = [] }, noEmitChange) {
    this.state = state
    // 图片需要预加载
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type === 'image') {
        elements[i].imageObj = await createImageObj(elements[i].url)
      }
    }
    this.helpUpdate()
    this.elements.deleteAllElements().createElementsFromData(elements)
    this.render.render()
    if (!noEmitChange) {
      this.emitChange()
    }
  }

  // 初始化画布
  initCanvas() {
    this.getContainerRectInfo()
    // 删除旧的canvas元素
    if (this.canvas) {
      this.container.removeChild(this.canvas)
    }
    // 创建canvas元素
    let { canvas, ctx } = createCanvas(this.width, this.height, {
      className: 'main'
    })
    this.canvas = canvas
    this.ctx = ctx
    this.container.appendChild(this.canvas)
  }

  // 容器尺寸调整
  resize() {
    // 初始化canvas元素
    this.initCanvas()
    // 在新的画布上绘制元素
    this.render.render()
    // 多选画布重新初始化
    this.selection.init()
    // 网格画布重新初始化
    this.grid.init()
    // 重新判断是否渲染网格
    this.grid.renderGrid()
  }

  // 更新状态数据，只是更新状态数据，不会触发重新渲染，如有需要重新渲染或其他操作需要自行调用相关方法
  updateState(data = {}) {
    this.state = {
      ...this.state,
      ...data
    }
    this.emitChange()
  }

  // 更新当前绘制类型
  updateCurrentType(drawType) {
    this.drawType = drawType
    // 图形绘制类型
    if (this.drawType === 'image') {
      this.imageEdit.selectImage()
    }
    // 设置鼠标指针样式
    // 开启橡皮擦模式
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

  // 获取数据，包括状态数据及元素数据
  getData() {
    return {
      state: {
        ...this.state
      },
      elements: this.elements.serialize()
    }
  }

  // 图片选择事件
  onImageSelectChange() {
    this.cursor.hide()
  }

  // 鼠标按下事件
  onMousedown(e, event) {
    if (this.state.readonly || this.mode.isDragMode) {
      // 只读模式下即将进行整体拖动
      this.mode.onStart()
      return
    }
    if (!this.elements.isCreatingElement && !this.textEdit.isEditing) {
      // 是否击中了某个元素
      let hitElement = this.elements.checkIsHitElement(e)
      if (this.drawType === 'selection') {
        // 当前是选择模式
        // 当前存在激活元素
        if (this.elements.hasActiveElement()) {
          // 判断按下的位置是否是拖拽部位
          let isResizing = this.elements.checkIsResize(
            event.mousedownPos.unGridClientX,
            event.mousedownPos.unGridClientY,
            e
          )
          // 不在拖拽部位则将当前的激活元素替换成hitElement
          if (!isResizing) {
            this.elements.setActiveElement(hitElement)
            this.render.render()
          }
        } else {
          // 当前没有激活元素
          if (this.selection.hasSelection) {
            // 当前存在多选元素，则判断按下的位置是否是多选元素的拖拽部位
            let isResizing = this.selection.checkIsResize(
              event.mousedownPos.unGridClientX,
              event.mousedownPos.unGridClientY,
              e
            )
            // 不在拖拽部位则复位多选，并将当前的激活元素替换成hitElement
            if (!isResizing) {
              this.selection.reset()
              this.elements.setActiveElement(hitElement)
              this.render.render()
            }
          } else if (hitElement) {
            // 激活击中的元素
            if (hitElement.hasGroup()) {
              this.group.setSelection(hitElement)
              this.onMousedown(e, event)
            } else {
              this.elements.setActiveElement(hitElement)
              this.render.render()
              this.onMousedown(e, event)
            }
          } else {
            // 上述条件都不符合则进行多选创建选区操作
            this.selection.onMousedown(e, event)
          }
        }
      } else if (this.drawType === 'eraser') {
        // 当前有击中元素
        // 橡皮擦模式则删除该元素
        this.deleteElement(hitElement)
      }
    }
  }

  // 鼠标移动事件
  onMousemove(e, event) {
    if (this.state.readonly || this.mode.isDragMode) {
      if (event.isMousedown) {
        // 只读模式下进行整体拖动
        this.mode.onMove(e, event)
      }
      return
    }
    // 鼠标按下状态
    if (event.isMousedown) {
      let mx = event.mousedownPos.x
      let my = event.mousedownPos.y
      let offsetX = Math.max(event.mouseOffset.x, 0)
      let offsetY = Math.max(event.mouseOffset.y, 0)
      // 选中模式
      if (this.drawType === 'selection') {
        if (this.selection.isResizing) {
          // 多选调整元素中
          this.selection.handleResize(
            e,
            mx,
            my,
            event.mouseOffset.x,
            event.mouseOffset.y
          )
        } else if (this.selection.creatingSelection) {
          // 多选创建选区中
          this.selection.onMousemove(e, event)
        } else {
          // 检测是否是正常的激活元素的调整操作
          this.elements.handleResize(
            e,
            mx,
            my,
            event.mouseOffset.x,
            event.mouseOffset.y
          )
        }
      } else if (['rectangle', 'diamond', 'triangle'].includes(this.drawType)) {
        // 类矩形元素绘制模式
        this.elements.creatingRectangleLikeElement(
          this.drawType,
          mx,
          my,
          offsetX,
          offsetY
        )
        this.render.render()
      } else if (this.drawType === 'circle') {
        // 绘制圆形模式
        this.elements.creatingCircle(mx, my, e)
        this.render.render()
      } else if (this.drawType === 'freedraw') {
        // 自由画笔模式
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
      // 鼠标没有按下状态
      // 图片放置中
      if (this.imageEdit.isReady) {
        this.cursor.hide()
        this.imageEdit.updatePreviewElPos(
          e.originEvent.clientX,
          e.originEvent.clientY
        )
      } else if (this.drawType === 'selection') {
        if (this.elements.hasActiveElement()) {
          // 当前存在激活元素
          // 检测是否划过激活元素的各个收缩手柄
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
          // 多选中检测是否可进行调整元素
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
          // 检测是否划过元素
          this.checkIsOnElement(e)
        }
      } else if (this.drawType === 'line') {
        // 线段绘制中
        this.elements.creatingLine(null, null, e, false, true)
        this.render.render()
      }
    }
  }

  // 检测是否滑过元素
  checkIsOnElement(e) {
    let hitElement = this.elements.checkIsHitElement(e)
    if (hitElement) {
      this.cursor.setMove()
    } else {
      this.cursor.reset()
    }
  }

  // 复位当前类型到选择模式
  resetCurrentType() {
    if (this.drawType !== 'selection') {
      this.drawType = 'selection'
      this.emit('currentTypeChange', 'selection')
    }
  }

  // 创建新元素完成
  completeCreateNewElement() {
    this.resetCurrentType()
    this.elements.completeCreateElement()
    this.render.render()
  }

  // 鼠标松开事件
  onMouseup(e) {
    if (this.state.readonly || this.mode.isDragMode) {
      return
    }
    if (this.drawType === 'text') {
      // 文字编辑模式
      if (!this.textEdit.isEditing) {
        this.createTextElement(e)
        this.resetCurrentType()
      }
    } else if (this.imageEdit.isReady) {
      // 图片放置模式
      this.elements.creatingImage(e, this.imageEdit.imageData)
      this.completeCreateNewElement()
      this.cursor.reset()
      this.imageEdit.reset()
    } else if (this.drawType === 'arrow') {
      // 箭头绘制模式
      this.elements.completeCreateArrow(e)
      this.completeCreateNewElement()
    } else if (this.drawType === 'line') {
      this.elements.completeCreateLine(e, () => {
        this.completeCreateNewElement()
      })
      this.render.render()
    } else if (this.elements.isCreatingElement) {
      // 正在创建元素中
      if (this.drawType === 'freedraw') {
        // 自由绘画模式可以连续绘制
        this.elements.completeCreateElement()
        this.elements.setActiveElement()
      } else {
        // 创建新元素完成
        this.completeCreateNewElement()
      }
    } else if (this.elements.isResizing) {
      // 调整元素操作结束
      this.elements.endResize()
      this.emitChange()
    } else if (this.selection.creatingSelection) {
      // 多选选区操作结束
      this.selection.onMouseup(e)
    } else if (this.selection.isResizing) {
      // 多选元素调整结束
      this.selection.endResize()
      this.emitChange()
    }
  }

  // 双击事件
  onDblclick(e) {
    if (this.drawType === 'line') {
      // 结束折线绘制
      this.completeCreateNewElement()
    } else {
      // 是否击中了某个元素
      let hitElement = this.elements.checkIsHitElement(e)
      if (hitElement) {
        // 编辑文字
        if (hitElement.type === 'text') {
          this.elements.editingText(hitElement)
          this.render.render()
          this.keyCommand.unBindEvent()
          this.textEdit.showTextEdit()
        }
      } else {
        // 双击空白处新增文字
        if (!this.textEdit.isEditing) {
          this.createTextElement(e)
        }
      }
    }
  }

  // 文本框失焦事件
  onTextInputBlur() {
    this.keyCommand.bindEvent()
    this.elements.completeEditingText()
    this.render.render()
    this.emitChange()
  }

  // 创建文本元素
  createTextElement(e) {
    this.elements.createElement({
      type: 'text',
      x: e.clientX,
      y: e.clientY
    })
    this.keyCommand.unBindEvent()
    this.textEdit.showTextEdit()
  }

  // 鼠标滚动事件
  onMousewheel(dir) {
    let stepNum = this.state.scrollStep / this.state.scale
    let step = dir === 'down' ? stepNum : -stepNum
    this.scrollTo(this.state.scrollX, this.state.scrollY + step)
  }

  // 右键菜单事件
  onContextmenu(e) {
    let elements = []
    if (this.elements.hasActiveElement()) {
      elements = [this.elements.activeElement]
    } else if (this.selection.hasSelectionElements()) {
      elements = this.selection.getSelectionElements()
    }
    this.emit('contextmenu', e.originEvent, elements)
  }

  // 触发更新事件
  emitChange() {
    let data = this.getData()
    this.history.add(data)
    this.emit('change', data)
  }
}
TinyWhiteboard.utils = utils
TinyWhiteboard.checkHit = checkHit
TinyWhiteboard.draw = draw
TinyWhiteboard.elements = elements

export default TinyWhiteboard
