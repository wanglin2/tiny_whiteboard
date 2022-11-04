import { getMultiElementRectInfo } from './utils'

// 渲染类
export default class Render {
  constructor(app) {
    this.app = app
    // 将被复制的激活的元素
    this.beingCopyActiveElement = null
    // 将被复制的选中的元素
    this.beingCopySelectedElements = []
    this.registerShortcutKeys()
  }

  // 清除画布
  clearCanvas() {
    let { width, height } = this.app
    this.app.ctx.clearRect(-width / 2, -height / 2, width, height)
    return this
  }

  // 绘制所有元素
  render() {
    let { state } = this.app
    // 清空画布
    this.clearCanvas()
    this.app.ctx.save()
    // 整体缩放
    this.app.ctx.scale(state.scale, state.scale)
    // 渲染所有元素
    this.app.elements.elementList.forEach(element => {
      // 不需要渲染
      if (element.noRender) {
        return
      }
      element.render()
    })
    this.app.group.render()
    this.app.ctx.restore()
    return this
  }

  // 注册快捷键
  registerShortcutKeys() {
    // 删除当前激活元素
    this.app.keyCommand.addShortcut('Del|Backspace', () => {
      this.deleteCurrentElements()
    })
    // 复制元素
    this.app.keyCommand.addShortcut('Control+c', () => {
      this.copyCurrentElement()
    })
    // 剪切元素
    this.app.keyCommand.addShortcut('Control+x', () => {
      this.cutCurrentElement()
    })
    // 撤销
    this.app.keyCommand.addShortcut('Control+z', () => {
      this.app.history.undo()
    })
    // 重做
    this.app.keyCommand.addShortcut('Control+y', () => {
      this.app.history.redo()
    })
    // 粘贴元素
    this.app.keyCommand.addShortcut('Control+v', () => {
      this.pasteCurrentElement(true)
    })
    // 放大
    this.app.keyCommand.addShortcut('Control++', () => {
      this.zoomIn()
    })
    // 缩小
    this.app.keyCommand.addShortcut('Control+-', () => {
      this.zoomOut()
    })
    // 缩放以适应所有元素
    this.app.keyCommand.addShortcut('Shift+1', () => {
      this.fit()
    })
    // 全部选中
    this.app.keyCommand.addShortcut('Control+a', () => {
      this.selectAll()
    })
    // 重置缩放
    this.app.keyCommand.addShortcut('Control+0', () => {
      this.setZoom(1)
    })
    // 显示隐藏网格
    this.app.keyCommand.addShortcut("Control+'", () => {
      if (this.app.state.showGrid) {
        this.app.grid.hideGrid()
      } else {
        this.app.grid.showGrid()
      }
    })
  }

  // 复制当前激活或选中的元素
  copyCurrentElement() {
    // 当前存在激活元素
    if (this.app.elements.activeElement) {
      this.beingCopySelectedElements = []
      this.beingCopyElement = this.app.elements.activeElement
    } else if (this.app.selection.hasSelectionElements()) {
      // 当前存在选中元素
      this.beingCopyElement = null
      this.beingCopySelectedElements = this.app.selection.getSelectionElements()
    }
  }

  // 剪切当前激活或选中的元素
  cutCurrentElement() {
    // 当前存在激活元素
    if (this.app.elements.activeElement) {
      this.copyCurrentElement()
      this.deleteCurrentElements()
    } else if (this.app.selection.hasSelectionElements()) {
      // 当前存在选中元素
      this.copyCurrentElement()
      this.deleteCurrentElements()
      this.app.selection.setMultiSelectElements(this.beingCopySelectedElements)
      this.app.selection.emitChange()
    }
  }

  // 粘贴被复制或剪切的元素
  pasteCurrentElement(useCurrentEventPos = false) {
    let pos = null
    // 使用当前鼠标所在的位置
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

  // 删除元素
  deleteElement(element) {
    this.app.elements.deleteElement(element)
    this.render()
    this.app.emitChange()
  }

  // 复制粘贴元素
  async copyElement(element, notActive = false, pos) {
    this.app.elements.cancelActiveElement()
    await this.app.elements.copyElement(element, notActive, pos)
    this.app.group.clearCopyMap()
    this.render()
    this.app.emitChange()
  }

  // 删除当前激活元素
  deleteActiveElement() {
    if (!this.app.elements.hasActiveElement()) {
      return
    }
    this.deleteElement(this.app.elements.activeElement)
  }

  // 删除当前激活或选中的元素
  deleteCurrentElements() {
    // 当前激活元素
    this.deleteActiveElement()
    // 当前选中元素
    this.app.selection.deleteSelectedElements()
  }

  // 将当前元素上移一层
  moveUpCurrentElement() {
    this.moveLevelCurrentElement('up')
  }

  // 将当前元素下移一层
  moveDownCurrentElement() {
    this.moveLevelCurrentElement('down')
  }

  // 将当前元素置于顶层
  moveTopCurrentElement() {
    this.moveLevelCurrentElement('top')
  }

  // 将当前元素置于底层
  moveBottomCurrentElement() {
    this.moveLevelCurrentElement('bottom')
  }

  // 移动当前元素的层级
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

  // 为激活元素设置样式
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

  // 为当前激活或选中的元素设置样式
  setCurrentElementsStyle(style = {}) {
    this.setActiveElementStyle(style)
    this.app.selection.setSelectedElementStyle(style)
  }

  // 取消当前激活元素
  cancelActiveElement() {
    if (!this.app.elements.hasActiveElement()) {
      return this
    }
    this.app.elements.cancelActiveElement()
    this.render()
    return this
  }

  // 更新当前激活元素的位置
  updateActiveElementPosition(x, y) {
    if (!this.app.elements.hasActiveElement()) {
      return this
    }
    this.app.elements.activeElement.updatePos(x, y)
    this.render()
    return this
  }

  // 更新当前激活元素的尺寸
  updateActiveElementSize(width, height) {
    if (!this.app.elements.hasActiveElement()) {
      return this
    }
    this.app.elements.activeElement.updateSize(width, height)
    this.render()
    return this
  }

  // 更新当前激活元素的旋转角度
  updateActiveElementRotate(rotate) {
    if (!this.app.elements.hasActiveElement()) {
      return this
    }
    this.app.elements.activeElement.updateRotate(rotate)
    this.render()
    return this
  }

  // 清空元素
  empty() {
    this.app.elements.deleteAllElements()
    this.render()
    this.app.history.clear()
    this.app.emitChange()
  }

  // 放大
  zoomIn(num = 0.1) {
    this.app.updateState({
      scale: this.app.state.scale + num
    })
    this.render()
    this.app.emit('zoomChange', this.app.state.scale)
  }

  // 缩小
  zoomOut(num = 0.1) {
    this.app.updateState({
      scale: this.app.state.scale - num > 0 ? this.app.state.scale - num : 0
    })
    this.render()
    this.app.emit('zoomChange', this.app.state.scale)
  }

  // 设置指定缩放值
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

  // 缩放以适应所有元素
  fit() {
    if (!this.app.elements.hasElements()) {
      return
    }
    this.scrollToCenter()
    // 计算所有元素的外包围框
    let { minx, maxx, miny, maxy } = getMultiElementRectInfo(
      this.app.elements.elementList
    )
    let width = maxx - minx
    let height = maxy - miny
    let maxScale = Math.min(this.app.width / width, this.app.height / height)
    this.setZoom(maxScale)
  }

  // 滚动至指定位置
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

  // 滚动至中心，即回到所有元素的中心位置
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

  // 复制粘贴当前元素
  copyPasteCurrentElements() {
    this.copyCurrentElement()
    this.pasteCurrentElement()
  }

  // 设置背景颜色
  setBackgroundColor(color) {
    this.app.updateState({
      backgroundColor: color
    })
    this.app.background.set()
  }

  // 选中所有元素
  selectAll() {
    this.app.selection.selectElements(this.app.elements.elementList)
  }
}
