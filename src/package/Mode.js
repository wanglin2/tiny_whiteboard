// 模式
export default class Mode {
  constructor(app) {
    this.app = app;
    this.movePos = {
      x: 0,
      y: 0,
    };
  }

  // 设置为编辑模式
  setEditMode() {
    this.app.cursor.reset();
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

  onMove(x, y) {
    this.app.ctx.save();
    this.app.ctx.translate(x, y);
    this.movePos.x = x;
    this.movePos.y = y;
    this.app.render.render();
    this.app.ctx.restore();
  }

  onEnd() {
    this.app.ctx.translate(this.movePos.x, this.movePos.y);
  }
}
