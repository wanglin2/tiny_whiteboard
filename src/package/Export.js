import {
  getRotatedPoint,
  getElementCornerPoint,
  getElementCenterPoint,
  createCanvas,
} from "./utils";

// 导入导出
export default class Export {
  constructor(app) {
    this.app = app;
    // 会把导出canvas绘制到页面上，方便测试
    this.openTest = false;
    // 数据保存
    this.saveState = {
      scale: 0,
      scrollY: 0,
      width: 0,
      height: 0,
    };
  }

  // 坐标转换
  transformPoint(x, y, element) {
    let center = getElementCenterPoint(element);
    // let { coordinate, state, width, height } = this.app;
    // // 屏幕坐标转画布坐标
    // let tp = coordinate.transformToCanvasCoordinate(x, y);
    // // 如果画布缩放了那么坐标也需要缩放
    // x = tp.x / state.scale + width / 2;
    // y = tp.y / state.scale + height / 2;
    // // 加上滚动偏移量
    // y = coordinate.addScrollY(y);
    // 旋转
    let rp = getRotatedPoint(x, y, center.x, center.y, element.rotate);
    return rp;
  }

  // 获取元素的四个角的坐标
  getElementCorners(element) {
    // 左上角
    let topLeft = getElementCornerPoint(element, "topLeft");
    topLeft = this.transformPoint(topLeft.x, topLeft.y, element);
    // 右上角
    let topRight = getElementCornerPoint(element, "topRight");
    topRight = this.transformPoint(topRight.x, topRight.y, element);
    // 左下角
    let bottomLeft = getElementCornerPoint(element, "bottomLeft");
    bottomLeft = this.transformPoint(bottomLeft.x, bottomLeft.y, element);
    // 右下角
    let bottomRight = getElementCornerPoint(element, "bottomRight");
    bottomRight = this.transformPoint(bottomRight.x, bottomRight.y, element);
    return [topLeft, topRight, bottomLeft, bottomRight];
  }

  // 获取所有元素的包围框
  getAllElementsBoundingRect() {
    let elements = this.app.render.elementList;
    let minx = Infinity;
    let maxx = -Infinity;
    let miny = Infinity;
    let maxy = -Infinity;
    elements.forEach((element) => {
      let pointList = this.getElementCorners(element);
      pointList.forEach(({ x, y }) => {
        if (x < minx) {
          minx = x;
        }
        if (x > maxx) {
          maxx = x;
        }
        if (y < miny) {
          miny = y;
        }
        if (y > maxy) {
          maxy = y;
        }
      });
    });
    return {
      minx,
      maxx,
      miny,
      maxy,
    };
  }

  // 显示
  show(canvas) {
    if (this.openTest) {
      canvas.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        background-color: #fff;
      `;
      document.body.appendChild(canvas);
    }
  }

  // 导出为图片
  exportImage({
    type = "image/png",
    renderBg = true,
    useBlob = false,
    paddingX = 10,
    paddingY = 10,
  } = {}) {
    // 计算所有元素的外包围框
    let { minx, maxx, miny, maxy } = this.getAllElementsBoundingRect();
    let width = maxx - minx + paddingX * 2;
    let height = maxy - miny + paddingY * 2;
    // 创建导出canvas
    let { canvas, ctx } = createCanvas(width, height, {
      noStyle: true,
      noTranslate: true,
    });
    this.show(canvas);
    this.saveAppState();
    this.changeAppState(minx - paddingX, miny - paddingY);
    // 绘制背景颜色
    if (renderBg && this.app.state.backgroundColor) {
      this.app.background.canvasAddBackgroundColor(
        ctx,
        width,
        height,
        this.app.state.backgroundColor
      );
    }
    // 绘制元素到导出canvas
    this.render(ctx);
    this.recoveryAppState();
    // 导出
    if (useBlob) {
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject();
          }
        }, type);
      });
    } else {
      return canvas.toDataURL(type);
    }
  }

  // 保存app类当前状态数据
  saveAppState() {
    let { width, height, state } = this.app;
    this.saveState.width = width;
    this.saveState.height = height;
    this.saveState.scale = state.scale;
    this.saveState.scrollY = state.scrollY;
  }

  // 临时修改app类状态数据
  changeAppState(minx, miny) {
    this.app.state.scale = 1;
    this.app.state.scrollY = 0;
    // 这里为什么要这么修改呢，原因是要把元素的坐标转换成当前导出画布的坐标，当前导出画布的坐标在左上角，比如一个元素的左上角原始坐标为(100,100),假设刚好minx和miny也是100，那么相当于元素的这个坐标要绘制到导出画布时的坐标应为(0,0)，所以元素绘制到导出画布的坐标均需要减去minx,miny，而元素在绘制时都会调用this.app.coordinate.transform方法进行转换，这个方法里使用的是this.app.width和this.app.height，所以方便起见直接修改这两个属性。
    this.app.width = minx * 2;
    this.app.height = miny * 2;
  }

  // 恢复app类状态数据
  recoveryAppState() {
    let { width, height, scale, scrollY } = this.saveState;
    this.app.state.scale = scale;
    this.app.state.scrollY = scrollY;
    this.app.width = width;
    this.app.height = height;
  }

  // 绘制所有元素
  render(ctx) {
    ctx.save();
    this.app.render.elementList.forEach((element) => {
      if (element.noRender) {
        return;
      }
      let cacheCtx = element.ctx;
      let cacheActive = element.isActive;
      // 临时修改绘图上下文为导出画布
      element.ctx = ctx;
      // 临时修改元素的激活状态为非激活
      element.isActive = false;
      element.render();
      element.ctx = cacheCtx;
      element.isActive = cacheActive;
    });
    ctx.restore();
  }

  // 导出为json数据
  exportJson() {
    return this.app.getData();
  }
}
