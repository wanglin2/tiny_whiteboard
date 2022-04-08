export default class Render {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;
  }

  // 清除画布
  clearCanvas() {
    let { canvasWidth, canvasHeight } = this.app;
    this.ctx.clearRect(
      -canvasWidth / 2,
      -canvasHeight / 2,
      canvasWidth,
      canvasHeight
    );
  }

  // 绘制所有元素
  render() {
    let { state, elements, canvasWidth, canvasHeight } = this.app;
    this.clearCanvas();
    this.ctx.save();
    // 缩放
    this.ctx.scale(state.scale, state.scale);
    elements.elementList.forEach((element) => {
      // 该元素不需要渲染
      if (element.noRender) {
        return;
      }
      // 超出可视范围的不需要渲染TODO:
      let { x, y, width, height, rotate, type, style } = element;
      x -= canvasWidth / 2;
      y -= canvasHeight / 2;
      // 加上滚动偏移
      y -= state.scrollY;
      let halfWidth = width / 2;
      let halfHeight = height / 2;
      // 移动画布中点到元素中心，否则旋转时中心点不对
      let cx = 0;
      let cy = 0;
      cx = x + halfWidth;
      cy = y + halfHeight;
      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(degToRad(rotate));
      this.drawShape.setCurrentStyle(style);
      // 画布中心点修改了，所以元素的坐标也要相应修改
      switch (type) {
        case "rectangle":
          this.drawShape.drawRect(-halfWidth, -halfHeight, width, height);
          break;
        case "circle":
          this.drawShape.drawCircle(0, 0, getCircleRadius(width, height));
          break;
        case "line":
          this.drawShape.drawLine(
            element.pointArr
              .map((point) => {
                return [point[0] - cx, point[1] - cy - state.scrollY];
              })
              .concat(
                // 加上鼠标当前实时位置
                element.pointArr.length > 0 &&
                  this.isCreatingElement &&
                  currentType === "line"
                  ? [
                      [
                        element.fictitiousPoint.x - cx,
                        element.fictitiousPoint.y - cy - state.scrollY,
                      ],
                    ]
                  : []
              )
          );
          break;
        case "freedraw":
          this.drawShape.drawFreeLine(
            element.pointArr.map((point) => {
              return [
                point[0] - cx,
                point[1] - cy - state.scrollY,
                ...point.slice(2),
              ];
            })
          );
          break;
        case "diamond":
          this.drawShape.drawDiamond(-halfWidth, -halfHeight, width, height);
          break;
        case "triangle":
          this.drawShape.drawTriangle(-halfWidth, -halfHeight, width, height);
          break;
        case "arrow":
          this.drawShape.drawArrow(
            element.pointArr
              .map((point) => {
                return [point[0] - cx, point[1] - cy - state.scrollY];
              })
              .concat(
                // 加上鼠标当前实时位置
                element.pointArr.length > 0 &&
                  this.isCreatingElement &&
                  currentType === "arrow"
                  ? [
                      [
                        element.fictitiousPoint.x - cx,
                        element.fictitiousPoint.y - cy - state.scrollY,
                      ],
                    ]
                  : []
              )
          );
          break;
        case "text":
          this.drawShape.drawText(
            element,
            -halfWidth,
            -halfHeight,
            width,
            height
          );
          break;
        case "image":
          this.drawShape.drawImage(
            element,
            -halfWidth,
            -halfHeight,
            width,
            height
          );
          break;
        default:
          break;
      }
      this.ctx.restore();
    });
    this.renderDragElement();
    this.ctx.restore();
  }

  // 渲染拖拽元素
  renderDragElement() {
    if (!this.element) {
      return;
    }
    let { x, y, width, height, rotate } = this.element;
    x -= this.app.canvasWidth / 2;
    y -= this.app.canvasHeight / 2;
    // 加上滚动偏移
    y -= this.app.state.scrollY;
    // 原点移动到元素的中心
    this.ctx.save();
    let cx = x + width / 2;
    let cy = y + height / 2;
    this.ctx.translate(cx, cy);
    this.ctx.rotate(degToRad(rotate));
    x = -width / 2;
    y = -height / 2;
    // 主体
    this.drawShape.setCurrentStyle({
      lineDash: [this.offset],
    });
    this.drawShape.drawRect(x, y, width, height);
    // 左上角
    this.drawShape.drawRect(x - this.size, y - this.size, this.size, this.size);
    // 右上角
    this.drawShape.drawRect(
      x + this.el.width + this.size,
      y - this.size,
      this.size,
      this.size
    );
    // 右下角
    this.drawShape.drawRect(
      x + this.el.width + this.size,
      y + this.el.height + this.size,
      this.size,
      this.size
    );
    // 左下角
    this.drawShape.drawRect(
      x - this.size,
      y + this.el.height + this.size,
      this.size,
      this.size
    );
    // 旋转按钮
    this.drawShape.drawCircle(
      x + this.el.width / 2 + this.size / 2,
      y - this.size * 2,
      this.size
    );
    this.ctx.restore();
  }
}
