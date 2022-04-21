// 模式
export default class Mode {
  constructor(app) {
    this.app = app;
  }

  // 设置为编辑模式
  setEditMode() {
    this.app.updateState({
      readonly: false,
    });
  }

  // 设置为只读模式
  setReadonlyMode() {
    this.app.updateState({
      readonly: true,
    });
  }
}
