import { throttle } from "./utils";

// 模式
export default class Mode {
  constructor(app) {
    this.app = app;
    this.startScrollX = 0;
    this.startScrollY = 0;
    // 稍微缓解一下卡顿
    this.onMove = throttle(this.onMove, this, 16);
  }

  // 设置为编辑模式
  setEditMode() {
    this.app.cursor.set("default");
    this.app.updateState({
      readonly: false,
    });
  }

  // 设置为只读模式
  setReadonlyMode() {
    this.app.cursor.set("grab");
    this.app.updateState({
      readonly: true,
    });
  }

  // 保存当前的滚动偏移量
  onStart() {
    this.startScrollX = this.app.state.scrollX;
    this.startScrollY = this.app.state.scrollY;
  }

  // 更新滚动偏移量并重新渲染
  onMove(e, event) {
    this.app.scrollTo(
      this.startScrollX - event.mouseOffset.originX / this.app.state.scale,
      this.startScrollY - event.mouseOffset.originY / this.app.state.scale
    );
  }

  // 结束拖拽
  onEnd() {
    this.startScrollX = 0;
    this.startScrollY = 0;
  }
}
