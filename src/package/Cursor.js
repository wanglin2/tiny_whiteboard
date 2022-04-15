import { CORNERS, DRAG_ELEMENT_PARTS } from "./constants";

// 鼠标样式类
export default class Cursor {
  constructor(app) {
    this.app = app;
    this.currentType = "default";
  }

  // 设置鼠标指针样式
  set(type = "default") {
    this.currentType = this.type;
    this.app.canvas.style.cursor = type;
  }

  // 隐藏鼠标指针
  hide() {
    this.set("none");
  }

  // 复位鼠标指针
  reset() {
    this.set();
  }

  // 设置为 ✚ 字型
  setCrosshair() {
    this.set("crosshair");
  }

  // 设置为 可移动 状态
  setMove() {
    this.set("move");
  }

  // 设置为某个方向的可移动状态
  setResize(dir) {
    let type = "";
    switch (dir) {
      case DRAG_ELEMENT_PARTS.BODY:
        type = "move";
        break;
      case DRAG_ELEMENT_PARTS.ROTATE:
        type = "grab";
        break;
      case DRAG_ELEMENT_PARTS.TOP_LEFT_BTN:
        type = "nw-resize";
        break;
      case DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN:
        type = "ne-resize";
        break;
      case DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN:
        type = "se-resize";
        break;
      case DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN:
        type = "sw-resize";
        break;
      default:
        break;
    }
    this.set(type);
  }
}
