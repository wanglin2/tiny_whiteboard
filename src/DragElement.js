import {
  getTowPointDistance,
  degToRad,
  transformPointOnElement,
} from "./utils";

export default class DragElement {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;
    this.drawShape = app.drawShape;

    this.el = null;
    this.element = null;

    // 标志位
    this.isInElement = false;
    this.isInRotateBtn = false;
    this.isInTopLeftBtn = false;
    this.isInTopRightBtn = false;
    this.isInBottomRightBtn = false;
    this.isInBottomLeftBtn = false;

    this.offset = 5;
    this.size = 10;

    // 当前鼠标按住拖拽元素的点的对角点
    this.diagonalPoint = {
      x: 0,
      y: 0,
    };

    // 当前鼠标按下时的坐标和拖拽元素的点的坐标差值
    this.mousedownPosAndElementPosOffset = {
      x: 0,
      y: 0,
    };
  }

  // 创建拖拽节点
  create(el) {
    if (!el) {
      this.delete();
      return;
    }
    this.el = el;
    let x = el.x - this.offset;
    let y = el.y - this.offset;
    let width = el.width + this.offset * 2;
    let height = el.height + this.offset * 2;
    this.element = {
      startX: 0,
      startY: 0,
      x,
      y,
      startRotate: 0,
      rotate: el.rotate || 0,
      width,
      height,
    };
  }

  // 删除拖拽节点
  delete() {
    this.el = null;
    this.element = null;
  }

  // 渲染
  render() {
    if (!this.element) {
      return;
    }
    let { x, y, width, height, rotate } = this.element;
    // 原点移动到元素的中心
    this.ctx.save();
    let cx = x + width / 2;
    let cy = y + height / 2;
    this.ctx.translate(cx, cy);
    this.ctx.rotate(degToRad(rotate));
    x = -width / 2;
    y = -height / 2;
    // 主体
    this.drawShape.drawRect(x, y, width, height, {
      lineDash: [this.offset],
    });
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
      x + this.el.width / 2,
      y - this.size * 2,
      this.size
    );
    this.ctx.restore();
  }

  // 更新尺寸
  updateSize(width, height) {
    this.element.width = width;
    this.element.height = height;
  }

  // 保存初始坐标
  savePos() {
    this.element.startX = this.element.x;
    this.element.startY = this.element.y;
  }

  // 更新坐标
  updatePos(x, y) {
    this.element.x = x;
    this.element.y = y;
  }

  // 偏移坐标
  offsetPos(ox, oy) {
    this.element.x = this.element.startX + ox;
    this.element.y = this.element.startY + oy;
  }

  // 保存初始化角度
  saveRotate() {
    this.element.startRotate = this.element.rotate;
  }

  // 偏移角度
  offsetRotate(or) {
    this.element.rotate = this.element.startRotate + or;
  }

  // 检测是否在拖拽元素内部
  checkIsInDragElement(x, y) {
    if (!this.element) return false;
    let rp = transformPointOnElement(x, y, this.element);
    return (
      rp.x >= this.element.x &&
      rp.x <= this.element.x + this.element.width &&
      rp.y >= this.element.y &&
      rp.y <= this.element.y + this.element.height
    );
  }

  // 检测是否在拖拽元素的旋转按钮内部
  checkIsInDragElementRotateBtn(x, y) {
    let rp = transformPointOnElement(x, y, this.element);
    return (
      getTowPointDistance(
        rp.x,
        rp.y,
        this.element.x + this.el.width / 2,
        this.element.y - this.size * 2
      ) <= this.size
    );
  }

  // 检测是否在拖拽元素的左上角伸缩手柄
  checkIsInDragElementTopLeftBtn(x, y) {
    let rp = transformPointOnElement(x, y, this.element);
    let _x = this.element.x - this.size;
    let _y = this.element.y - this.size;
    return (
      rp.x >= _x &&
      rp.x <= _x + this.size &&
      rp.y >= _y &&
      rp.y <= _y + this.size
    );
  }

  // 检测是否在拖拽元素的右上角伸缩手柄
  checkIsInDragElementTopRightBtn(x, y) {
    let rp = transformPointOnElement(x, y, this.element);
    let _x = this.element.x + this.el.width + this.size;
    let _y = this.element.y - this.size;
    return (
      rp.x >= _x &&
      rp.x <= _x + this.size &&
      rp.y >= _y &&
      rp.y <= _y + this.size
    );
  }

  // 检测是否在拖拽元素的右下角伸缩手柄
  checkIsInDragElementBottomRightBtn(x, y) {
    let rp = transformPointOnElement(x, y, this.element);
    let _x = this.element.x + this.el.width + this.size
    let _y = this.element.y + this.el.height + this.size
    return (
      rp.x >= _x &&
      rp.x <= _x + this.size &&
      rp.y >= _y &&
      rp.y <= _y + this.size
    );
  }

  // 检测是否在拖拽元素的左下角伸缩手柄
  checkIsInDragElementBottomLeftBtn(x, y) {
    let rp = transformPointOnElement(x, y, this.element);
    let _x = this.element.x - this.size
    let _y = this.element.y + this.el.height + this.size
    return (
      rp.x >= _x &&
      rp.x <= _x + this.size &&
      rp.y >= _y &&
      rp.y <= _y + this.size
    );
  }
}
