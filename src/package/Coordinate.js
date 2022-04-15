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

  // 综合转换
  transform(x, y) {
    let t = this.transformToCanvasCoordinate(x, y);
    return {
      x: t.x,
      y: this.addScrollY(t.y),
    };
  }
}
