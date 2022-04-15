import { degToRad, getBoundingRect } from "../utils";

// 基础元素类
export default class BaseElement {
  constructor(opts = {}, app) {
    this.app = app;
    this.ctx = app.ctx;
    this.draw = app.draw;
    // 类型
    this.type = opts.type || "";
    // 是否正在创建中
    this.isCreating = true;
    // 是否被激活
    this.isActive = true;
    // 记录初始位置，用于拖动时
    this.startX = 0;
    this.startY = 0;
    // 实时位置，该位置为元素的左上角坐标
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    // 宽高
    this.width = opts.width || 0;
    this.height = opts.height || 0;
    // 记录初始角度，用于旋转时
    this.startRotate = 0;
    // 角度
    this.rotate = opts.rotate || 0;
    // 是否不需要渲染
    this.noRender = false;
    // 样式
    this.style = {
      strokeStyle: "#000000", // 线条颜色
      fillStyle: "transparent", // 填充颜色
      lineWidth: "small", // 线条宽度
      lineDash: 0, // 线条虚线大小
      globalAlpha: 1, // 透明度
    };
    // 拖拽元素实例
    this.dragElement = null;
  }

  // 渲染方法
  render() {
    throw new Error("子类需要实现该方法！");
  }

  // 处理样式数据
  handleStyle(style) {
    Object.keys(style).forEach((key) => {
      // 处理线条宽度
      if (key === "lineWidth") {
        if (style[key] === "small") {
          style[key] = 2;
        } else if (style[key] === "middle") {
          style[key] = 4;
        } else if (style[key] === "large") {
          style[key] = 6;
        }
      }
    });
    return style;
  }

  // 设置绘图样式
  setStyle(style = {}) {
    let _style = this.handleStyle(style);
    Object.keys(_style).forEach((key) => {
      // 处理虚线
      if (key === "lineDash") {
        if (_style.lineDash > 0) {
          this.ctx.setLineDash([_style.lineDash]);
        }
      } else {
        this.ctx[key] = _style[key];
      }
    });
    return this;
  }

  // 公共渲染操作
  warpRender(renderFn) {
    let { x, y, width, height, rotate, style } = this;
    // 坐标转换
    let { x: tx, y: ty } = this.app.coordinate.transform(x, y);
    // 移动画布中点到元素中心，否则旋转时中心点不对
    let halfWidth = width / 2;
    let halfHeight = height / 2;
    let cx = tx + halfWidth;
    let cy = ty + halfHeight;
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(degToRad(rotate));
    this.setStyle(style);
    renderFn({
      halfWidth,
      halfHeight,
      tx,
      ty,
      cx,
      cy,
    });
    this.ctx.restore();
    return this;
  }

  // 保存元素初始状态
  saveState() {
    let { rotate, x, y } = this;
    this.startRotate = rotate;
    this.startX = x;
    this.startY = y;
    return this;
  }

  // 移动元素
  move(ox, oy) {
    let { startX, startY } = this;
    this.x = startX + ox;
    this.y = startY + oy;
    return this;
  }

  // 更新元素包围框
  updateRect(x, y, width, height) {
    this.updatePos(x, y);
    this.updateSize(width, height);
    return this;
  }

  // 更新激活元素尺寸
  updateSize(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }

  // 更新激活元素坐标
  updatePos(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  // 偏移元素角度
  offsetRotate(or) {
    this.rotate = this.startRotate + or;
    return this;
  }

  // 检测元素是否被击中
  isHit(x, y) {
    throw new Error("子类需要实现该方法!");
  }

  // 开始调整元素
  startResize(resizeType, e) {
    this.dragElement.startResize(resizeType, e);
    return this;
  }

  // 结束调整元素操作
  endResize() {
    this.dragElement.endResize();
    return this;
  }

  // 调整元素中
  resize(...args) {
    this.dragElement.handleResizeElement(...args);
    return this;
  }

  // 添加坐标，具有多个坐标数据的图形，如线段、自由线
  addPoint(x, y, ...args) {
    if (!Array.isArray(this.pointArr)) {
      return;
    }
    this.pointArr.push([x, y, ...args]);
    return this;
  }

  // 更新元素包围框，用于具有多个坐标数据的图形
  updateMultiPointBoundingRect() {
    let rect = getBoundingRect(this.pointArr);
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
    return this;
  }
}
