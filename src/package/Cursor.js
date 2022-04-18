import { CORNERS, DRAG_ELEMENT_PARTS } from "./constants";

// 鼠标样式类
export default class Cursor {
  constructor(app) {
    this.app = app;
    this.currentType = "default";
  }

  // 设置鼠标指针样式
  set(type = "default") {
    this.currentType = type;
    let style = type;
    if (type === "eraser") {
      style = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAARRJREFUOE/dlDFLxEAQhd+BVouFZ3vlQuwSyI+5a7PBRkk6k9KzTOwStJFsWv0xgaQzkNLWszim0kL2OOFc9oKRYHFTz37Lm/dmJhi5JiPzcBjAOYDz7WheADz3jalP8oIxds85P3Zd90RBqqpad133SUSXAJ5M4H3AhWVZd1EUzYQQP96VZYkkSV7btr02QY1Axtgqz/NTz/OM6qSUCMNwRURneoMJOLdt+7Gu643MfeU4zrppmgt9pibgjRBiWRRFb0R934eUcgngdrfxX4CjSwZj7C3Lsqnu8Lc05XQQBO9ENP2NKapnE5s4jme608rhNE2HxWb7qwr2A+f8SAv2BxFdDQ32rpLRVu9Pl+0wztcg6V/VPW4Vw1FsawAAAABJRU5ErkJggg==) 10 10, auto`;
    }
    this.app.canvas.style.cursor = style;
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

  // 设置为橡皮擦样式
  setEraser() {
    this.set("eraser");
  }
}
