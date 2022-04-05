import {
  getTowPointDistance,
  degToRad,
  transformPointOnElement,
  checkPointIsInRectangle,
} from "./utils";
import { CORNERS, DRAG_ELEMENT_PARTS } from "./constants";

export default class DragElement {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;
    this.drawShape = app.drawShape;

    this.el = null;
    this.element = null;

    // 标志位
    this.inDragElementPart = "";

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

  // 复位
  reset() {
    this.el = null;
    this.element = null;
    this.inDragElementPart = "";
    this.diagonalPoint = {
      x: 0,
      y: 0,
    };
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
    })
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

  // 将拖拽元素的位置宽高转换为内部元素的位置宽高
  getElPosAndSizeFromDragElement(x, y, width, height) {
    return {
      x: x + this.offset,
      y: y + this.offset,
      width: width - this.offset * 2,
      height: height - this.offset * 2,
    };
  }

  // 保存初始坐标
  savePos() {
    this.element.startX = this.element.x;
    this.element.startY = this.element.y;
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

  // 检测一个坐标在拖拽元素的哪个部分上
  checkPointInDragElementWhere(x, y) {
    let part = "";
    if (this.element) {
      // 坐标反向旋转元素的角度
      let rp = transformPointOnElement(x, y, this.element);
      // 在内部
      if (checkPointIsInRectangle(rp.x, rp.y, this.element)) {
        part = DRAG_ELEMENT_PARTS.BODY;
      } else if (
        getTowPointDistance(
          rp.x,
          rp.y,
          this.element.x + this.el.width / 2,
          this.element.y - this.size * 2
        ) <= this.size
      ) {
        // 在旋转按钮
        part = DRAG_ELEMENT_PARTS.ROTATE;
      } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.TOP_LEFT)) {
        // 在左上角伸缩手柄
        part = DRAG_ELEMENT_PARTS.TOP_LEFT_BTN;
      } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.TOP_RIGHT)) {
        // 在右上角伸缩手柄
        part = DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN;
      } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.BOTTOM_RIGHT)) {
        // 在右下角伸缩手柄
        part = DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN;
      } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.BOTTOM_LEFT)) {
        // 在左下角伸缩手柄
        part = DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN;
      }
    }
    return (this.inDragElementPart = part);
  }

  // 检测坐标是否在某个拖拽按钮内
  _checkPointIsInBtn(x, y, dir) {
    let _x = 0;
    let _y = 0;
    switch (dir) {
      case CORNERS.TOP_LEFT:
        _x = this.element.x - this.size;
        _y = this.element.y - this.size;
        break;
      case CORNERS.TOP_RIGHT:
        _x = this.element.x + this.el.width + this.size;
        _y = this.element.y - this.size;
        break;
      case CORNERS.BOTTOM_RIGHT:
        _x = this.element.x + this.el.width + this.size;
        _y = this.element.y + this.el.height + this.size;
        break;
      case CORNERS.BOTTOM_LEFT:
        _x = this.element.x - this.size;
        _y = this.element.y + this.el.height + this.size;
        break;
      default:
        break;
    }
    return checkPointIsInRectangle(x, y, _x, _y, this.size, this.size);
  }
}
