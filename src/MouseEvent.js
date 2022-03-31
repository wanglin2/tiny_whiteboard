import { getTowPointDistance } from "./utils";

export default class MouseEvent {
  constructor(
    app,
    mousedownCallback,
    mousemoveCallback,
    mouseupCallback,
    dblclickCallback
  ) {
    this.app = app;
    this.mousedownCallback = mousedownCallback;
    this.mousemoveCallback = mousemoveCallback;
    this.mouseupCallback = mouseupCallback;
    this.dblclickCallback = dblclickCallback;

    // 鼠标相关
    this.isMousedown = false;
    // 按下时的鼠标位置
    this.mousedownPos = {
      x: 0,
      y: 0,
    };
    // 鼠标当前位置和按下时位置的差值
    this.mouseOffset = {
      x: 0,
      y: 0,
    };
    // 记录上一时刻的鼠标位置
    this.lastPos = {
      x: 0,
      y: 0,
    };
    // 前一瞬间的鼠标移动距离
    this.distance = 0;
    // 记录上一时刻的时间
    this.lastTime = Date.now();
    // 前一瞬间的时间
    this.duration = 0;
    // 前一瞬间的鼠标移动速度
    this.speed = 0;

    this.onMousedown = this.onMousedown.bind(this);
    this.onMousemove = this.onMousemove.bind(this);
    this.onMouseup = this.onMouseup.bind(this);
    this.onDblclick = this.onDblclick.bind(this);
    this.bindEvent();
  }

  // 绑定canvas事件
  bindEvent() {
    this.app.canvasEl.addEventListener("mousedown", this.onMousedown);
    this.app.canvasEl.addEventListener("mousemove", this.onMousemove);
    this.app.canvasEl.addEventListener("mouseup", this.onMouseup);
    this.app.canvasEl.addEventListener("dblclick", this.onDblclick);
  }

  // 解绑事件
  unbindEvent() {
    this.app.canvasEl.removeEventListener("mousedown", this.onMousedown);
    this.app.canvasEl.removeEventListener("mousemove", this.onMousemove);
    this.app.canvasEl.removeEventListener("mouseup", this.onMouseup);
    this.app.canvasEl.removeEventListener("dblclick", this.onDblclick);
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
    let x = e.clientX;
    let y = e.clientY;
    // 鼠标按下状态
    if (this.isMousedown) {
      this.mouseOffset.x = x - this.mousedownPos.x;
      this.mouseOffset.y = y - this.mousedownPos.y;
    }
    let curTime = Date.now();
    this.duration = curTime - this.lastTime;
    this.distance = getTowPointDistance(x, y, this.lastPos.x, this.lastPos.y);
    this.speed = this.distance / this.duration;
    this.mousemoveCallback.call(this.app, e, this);
    this.lastTime = curTime;
    this.lastPos.x = x;
    this.lastPos.y = y;
  }

  // 鼠标松开事件
  onMouseup(e) {
    // 复位
    this.isMousedown = false;
    this.mousedownPos.x = 0;
    this.mousedownPos.y = 0;
    this.mouseupCallback.call(this.app, e, this);
  }

  // 双击事件
  onDblclick(e) {
    this.dblclickCallback.call(this.app, e, this);
  }
}
