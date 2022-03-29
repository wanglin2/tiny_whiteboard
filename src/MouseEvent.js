export default class MouseEvent {
  constructor(app, mousedownCallback, mousemoveCallback, mouseupCallback) {
    this.app = app;
    this.mousedownCallback = mousedownCallback;
    this.mousemoveCallback = mousemoveCallback;
    this.mouseupCallback = mouseupCallback;
    // 鼠标相关
    this.isMousedown = false;
    this.mousedownPos = {
      x: 0,
      y: 0,
    };
    this.mouseOffset = {
      x: 0,
      y: 0,
    };

    this.onMousedown = this.onMousedown.bind(this);
    this.onMousemove = this.onMousemove.bind(this);
    this.onMouseup = this.onMouseup.bind(this);
    this.bindEvent();
  }

  // 绑定canvas事件
  bindEvent() {
    this.app.canvasEl.addEventListener("mousedown", this.onMousedown);
    this.app.canvasEl.addEventListener("mousemove", this.onMousemove);
    this.app.canvasEl.addEventListener("mouseup", this.onMouseup);
  }

  // 解绑事件
  unbindEvent() {
    this.app.canvasEl.removeEventListener("mousedown", this.onMousedown);
    this.app.canvasEl.removeEventListener("mousemove", this.onMousemove);
    this.app.canvasEl.removeEventListener("mouseup", this.onMouseup);
  }

  // 鼠标按下事件
  onMousedown(e) {
    this.isMousedown = true;
    this.mousedownPos.x = e.clientX;
    this.mousedownPos.y = e.clientY;
    this.mousedownCallback.call(this.app, e, this);
  }

  // 鼠标移动事件
  onMousemove(e) {
    // 鼠标按下状态
    if (this.isMousedown) {
      this.mouseOffset.x = e.clientX - this.mousedownPos.x;
      this.mouseOffset.y = e.clientY - this.mousedownPos.y;
    }
    this.mousemoveCallback.call(this.app, e, this);
  }

  // 鼠标松开事件
  onMouseup(e) {
    // 复位
    this.isMousedown = false;
    this.mousedownPos.x = 0;
    this.mousedownPos.y = 0;
    this.mouseupCallback.call(this.app, e, this);
  }
}
