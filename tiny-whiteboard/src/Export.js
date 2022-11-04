import { createCanvas, getMultiElementRectInfo } from './utils'

// 导入导出
export default class Export {
  constructor(app) {
    this.app = app
    // 会把导出canvas绘制到页面上，方便测试
    this.openTest = false
    // 数据保存
    this.saveState = {
      scale: 0,
      scrollX: 0,
      scrollY: 0,
      width: 0,
      height: 0
    }
  }

  // 显示
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

  // 获取要导出的元素
  getElementList(onlySelected = true) {
    // 导出所有元素
    if (!onlySelected) {
      return this.app.elements.elementList
    } else {
      // 仅导出激活或选中的元素
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

  // 导出为图片
  exportImage({
    type = 'image/png',
    renderBg = true,
    useBlob = false,
    paddingX = 10,
    paddingY = 10,
    onlySelected
  } = {}) {
    // 计算所有元素的外包围框
    let { minx, maxx, miny, maxy } = getMultiElementRectInfo(
      this.getElementList(onlySelected)
    )
    let width = maxx - minx + paddingX * 2
    let height = maxy - miny + paddingY * 2
    // 创建导出canvas
    let { canvas, ctx } = createCanvas(width, height, {
      noStyle: true,
      noTranslate: true
    })
    this.show(canvas)
    this.saveAppState()
    this.changeAppState(minx - paddingX, miny - paddingY, ctx)
    // 绘制背景颜色
    if (renderBg && this.app.state.backgroundColor) {
      this.app.background.canvasAddBackgroundColor(
        ctx,
        width,
        height,
        this.app.state.backgroundColor
      )
    }
    // 绘制元素到导出canvas
    this.render(ctx, onlySelected)
    this.recoveryAppState()
    // 导出
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

  // 保存app类当前状态数据
  saveAppState() {
    let { width, height, state, ctx } = this.app
    this.saveState.width = width
    this.saveState.height = height
    this.saveState.scale = state.scale
    this.saveState.scrollX = state.scrollX
    this.saveState.scrollY = state.scrollY
    this.saveState.ctx = ctx
  }

  // 临时修改app类状态数据
  changeAppState(minx, miny, ctx) {
    this.app.ctx = ctx
    this.app.state.scale = 1
    this.app.state.scrollX = 0
    this.app.state.scrollY = 0
    // 这里为什么要这么修改呢，原因是要把元素的坐标转换成当前导出画布的坐标，当前导出画布的坐标在左上角，比如一个元素的左上角原始坐标为(100,100),假设刚好minx和miny也是100，那么相当于元素的这个坐标要绘制到导出画布时的坐标应为(0,0)，所以元素绘制到导出画布的坐标均需要减去minx,miny，而元素在绘制时都会调用this.app.coordinate.transform方法进行转换，这个方法里使用的是this.app.width和this.app.height，所以方便起见直接修改这两个属性。
    this.app.width = minx * 2
    this.app.height = miny * 2
  }

  // 恢复app类状态数据
  recoveryAppState() {
    let { width, height, scale, scrollX, scrollY, ctx } = this.saveState
    this.app.state.scale = scale
    this.app.state.scrollX = scrollX
    this.app.state.scrollY = scrollY
    this.app.width = width
    this.app.height = height
    this.app.ctx = ctx
  }

  // 绘制所有元素
  render(ctx, onlySelected) {
    ctx.save()
    this.getElementList(onlySelected).forEach(element => {
      if (element.noRender) {
        return
      }
      let cacheActive = element.isActive
      let cacheSelected = element.isSelected
      // 临时修改元素的激活状态为非激活、非选中
      element.isActive = false
      element.isSelected = false
      element.render()
      element.isActive = cacheActive
      element.isSelected = cacheSelected
    })
    ctx.restore()
  }

  // 导出为json数据
  exportJson() {
    return this.app.getData()
  }
}
