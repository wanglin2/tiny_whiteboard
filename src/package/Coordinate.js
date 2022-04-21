// 坐标转换类
export default class Coordinate {
  constructor(app) {
    this.app = app;
  }

  // 添加垂直滚动距离
  addScrollY(y) {
    return y + this.app.state.scrollY;
  }

  // 减去垂直滚动距离
  subScrollY(y) {
    return y - this.app.state.scrollY;
  }

  // 屏幕坐标转换成画布坐标
  transformToCanvasCoordinate(x, y) {
    x -= this.app.width / 2;
    y -= this.app.height / 2;
    return {
      x,
      y,
    };
  }

  // 画布转换转屏幕坐标
  transformToScreenCoordinate(x, y) {
    x += this.app.width / 2;
    y += this.app.height / 2;
    return {
      x,
      y,
    };
  }

  // 综合转换，屏幕坐标转画布坐标，再减去滚动值
  transform(x, y) {
    let t = this.transformToCanvasCoordinate(x, y);
    return {
      x: t.x,
      y: this.subScrollY(t.y),
    };
  }

  // 相对窗口的坐标转换成相对容器的，用于当容器非全屏的时候
  windowToContainer(x, y) {
    return {
      x: x - this.app.left,
      y: y - this.app.top,
    };
  }

  // 相对容器的坐标转换成相对窗口的，用于当容器非全屏的时候
  containerToWindow(x, y) {
    return {
      x: x + this.app.left,
      y: y + this.app.top,
    };
  }

  // 屏幕坐标在应用画布缩放后的位置
  scale(x, y) {
    let { state } = this.app;
    // 屏幕坐标转画布坐标
    let wp = this.transformToCanvasCoordinate(x, y);
    let sp = this.transformToScreenCoordinate(
      wp.x * state.scale,
      wp.y * state.scale
    );
    return {
      x: sp.x,
      y: sp.y,
    };
  }

  // 屏幕坐标在反向应用画布缩放后的位置
  reverseScale(x, y) {
    let { state } = this.app;
    // 屏幕坐标转画布坐标
    let tp = this.transformToCanvasCoordinate(x, y);
    let sp = this.transformToScreenCoordinate(
      tp.x / state.scale,
      tp.y / state.scale
    );
    return {
      x: sp.x,
      y: sp.y,
    };
  }

  // 网格吸附
  gridAdsorbent(x, y) {
    let { gridConfig, showGrid } = this.app.state;
    if (!showGrid) {
      return {
        x,
        y,
      };
    }
    let gridSize = gridConfig.size;
    return {
      x: x - (x % gridSize),
      y: y - (y % gridSize),
    };
  }
}
