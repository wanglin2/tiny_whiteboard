import { getTowPointDistance } from "./utils";
import EventEmitter from "eventemitter3";

// 事件类
export default class Event extends EventEmitter {
  constructor(app) {
    super();
    this.app = app;
    this.coordinate = app.coordinate;

    // 鼠标是否按下
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
    this.lastMousePos = {
      x: 0,
      y: 0,
    };
    // 前一瞬间的鼠标移动距离
    this.mouseDistance = 0;
    // 记录上一时刻的时间
    this.lastMouseTime = Date.now();
    // 前一瞬间的时间
    this.mouseDuration = 0;
    // 前一瞬间的鼠标移动速度
    this.mouseSpeed = 0;
    // 绑定事件
    this.onMousedown = this.onMousedown.bind(this);
    this.onMousemove = this.onMousemove.bind(this);
    this.onMouseup = this.onMouseup.bind(this);
    this.onDblclick = this.onDblclick.bind(this);
    this.onMousewheel = this.onMousewheel.bind(this);
    this.bindEvent();
  }

  // 绑定canvas事件
  bindEvent() {
    this.app.container.addEventListener("mousedown", this.onMousedown);
    this.app.container.addEventListener("mousemove", this.onMousemove);
    this.app.container.addEventListener("mouseup", this.onMouseup);
    this.app.container.addEventListener("dblclick", this.onDblclick);
    this.app.container.addEventListener("mousewheel", this.onMousewheel);
  }

  // 解绑事件
  unbindEvent() {
    this.app.container.removeEventListener("mousedown", this.onMousedown);
    this.app.container.removeEventListener("mousemove", this.onMousemove);
    this.app.container.removeEventListener("mouseup", this.onMouseup);
    this.app.container.removeEventListener("dblclick", this.onDblclick);
    this.app.container.removeEventListener("mousewheel", this.onMousewheel);
  }

  // 转换事件对象e，将clientY添加上滚动距离scrollY
  transformEvent(e) {
    let { coordinate } = this.app;
    // 容器和窗口左上角存在距离时转换
    let wp = coordinate.windowToContainer(e.clientX, e.clientY);
    // 元素缩放是*scale，所以视觉上我们点击到了元素，但是实际上元素的位置还是原来的x,y，所以鼠标的坐标需要/scale
    let { x, y } = coordinate.reverseScale(wp.x, wp.y);
    let newEvent = {
      originEvent: e,
      originClientX: x,
      originClientY: y,
      clientX: x,
      clientY: coordinate.addScrollY(y), // 向下滚动scroll值为正，而canvas坐标系向下为正，所以要造成元素向上滚动的效果显示的时候元素的y坐标需要减去scroll值，但是元素真实的y值并未改变，所以对于鼠标坐标来说需要加上scroll值，这样才能匹配元素真实的y坐标
    };
    return newEvent;
  }

  // 鼠标按下事件
  onMousedown(e) {
    e = this.transformEvent(e);
    this.isMousedown = true;
    this.mousedownPos.x = e.clientX;
    this.mousedownPos.y = e.clientY;
    this.emit("mousedown", e, this);
  }

  // 鼠标移动事件
  onMousemove(e) {
    e = this.transformEvent(e);
    let x = e.clientX;
    let y = e.clientY;
    // 鼠标按下状态
    if (this.isMousedown) {
      this.mouseOffset.x = x - this.mousedownPos.x;
      this.mouseOffset.y = y - this.mousedownPos.y;
    }
    let curTime = Date.now();
    // 距离上一次的时间
    this.mouseDuration = curTime - this.lastMouseTime;
    // 距离上一次的距离
    this.mouseDistance = getTowPointDistance(
      x,
      y,
      this.lastMousePos.x,
      this.lastMousePos.y
    );
    // 鼠标移动速度
    this.mouseSpeed = this.mouseDistance / this.mouseDuration;
    this.emit("mousemove", e, this);
    // 更新变量
    this.lastMouseTime = curTime;
    this.lastMousePos.x = x;
    this.lastMousePos.y = y;
  }

  // 鼠标松开事件
  onMouseup(e) {
    e = this.transformEvent(e);
    // 复位
    this.isMousedown = false;
    this.mousedownPos.x = 0;
    this.mousedownPos.y = 0;
    this.emit("mouseup", e, this);
  }

  // 双击事件
  onDblclick(e) {
    e = this.transformEvent(e);
    this.emit("dblclick", e, this);
  }

  // 鼠标滚动事件
  onMousewheel(e) {
    e = this.transformEvent(e);
    this.emit("mousewheel", e.originEvent.wheelDelta < 0 ? "down" : "up");
  }
}
