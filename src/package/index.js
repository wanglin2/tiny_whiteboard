import EventEmitter from "eventemitter3";
import { createCanvas, getTowPointDistance, throttle } from "./utils";
import Coordinate from "./Coordinate";
import Event from "./Event";
import Render from "./Render";
import ImageEdit from "./ImageEdit";
import Cursor from "./Cursor";

// 主类
export default class TinyWhiteboard extends EventEmitter {
  constructor(opts = {}) {
    super();
    // 参数
    this.opts = opts;
    // 容器元素
    this.container = opts.container;
    // 当前绘制类型
    this.drawType = opts.drawType || "selection";
    // 对容器做一些必要检查
    if (!this.container) {
      throw new Error("缺少 container 参数！");
    }
    if (
      !["absolute", "fixed", "relative"].includes(
        window.getComputedStyle(this.container).position
      )
    ) {
      throw new Error("container元素需要设置定位！");
    }
    // 宽高
    let { width, height } = this.container.getBoundingClientRect();
    this.width = width;
    this.height = height;
    // 主要的渲染canvas元素
    this.canvas = null;
    // canvas绘制上下文
    this.ctx = null;
    // 画布状态
    this.state = {
      scale: 1, // 缩放
      scrollY: 0, // 垂直方向的滚动偏移量
      backgroundColor: "", // 背景颜色
      ...opts,
    };

    // 初始化画布
    this.initCanvas();
    // 实例化坐标转换类
    this.coordinate = new Coordinate(this);
    // 实例化事件类
    this.event = new Event(this);
    this.event.on("mousedown", this.onMousedown, this);
    this.event.on("mousemove", this.onMousemove, this);
    this.event.on("mouseup", this.onMouseup, this);
    this.event.on("dblclick", this.onDblclick, this);
    // 图片选择类
    this.imageEdit = new ImageEdit(this);
    this.imageEdit.on("imageSelectChange", this.onImageSelectChange, this);
    // 鼠标样式类
    this.cursor = new Cursor(this);
    // 实例化渲染类
    this.render = new Render(this);

    // 代理
    this.proxy();
    this.checkIsOnElement = throttle(this.checkIsOnElement, this);
  }

  // 代理各个类的方法到实例上
  proxy() {
    // render类
    ["setElementStyle"].forEach((method) => {
      this[method] = this.render[method].bind(this.render);
    });
  }

  // 初始化画布
  initCanvas() {
    // 创建canvas元素
    let { canvas, ctx } = createCanvas(this.width, this.height);
    this.canvas = canvas;
    this.ctx = ctx;
    this.container.appendChild(this.canvas);
  }

  // 更新当前绘制类型
  updateCurrentType(drawType) {
    this.drawType = drawType;
    // 图形绘制类型
    if (drawType === "image") {
      this.imageEdit.selectImage();
      this.resetCurrentType();
    }
    // 设置鼠标指针样式
    if (drawType !== "selection") {
      this.cursor.setCrosshair();
    } else {
      this.cursor.reset();
    }
  }

  // 清除当前激活元素
  clearActiveElements() {
    this.render.clearActiveElements().render();
  }

  // 图片选择事件
  onImageSelectChange() {
    this.cursor.hide();
  }

  // 鼠标按下事件
  onMousedown(e, event) {
    let mx = event.mousedownPos.x;
    let my = event.mousedownPos.y;
    if (!this.render.isCreatingElement) {
      // 是否击中了某个元素
      let hitElement = this.render.checkIsHitElement(e);
      // 当前存在激活元素
      if (this.render.hasActiveElements()) {
        let isResizing = this.render.checkIsResize(mx, my, e);
        // 不在调整元素中
        if (!isResizing) {
          this.render.setActiveElements(hitElement).render();
        }
      } else {
        // 当前没有激活元素
        if (hitElement) {
          this.render.setActiveElements(hitElement).render();
        }
      }
    }
  }

  // 鼠标移动事件
  onMousemove(e, event) {
    // 鼠标按下状态
    if (event.isMousedown) {
      let mx = event.mousedownPos.x;
      let my = event.mousedownPos.y;
      let offsetX = Math.max(event.mouseOffset.x, 0);
      let offsetY = Math.max(event.mouseOffset.y, 0);

      // 选中模式
      if (this.drawType === "selection") {
        this.render.handleResize(
          e,
          mx,
          my,
          event.mouseOffset.x,
          event.mouseOffset.y
        );
      } else if (["rectangle", "diamond", "triangle"].includes(this.drawType)) {
        // 类矩形元素绘制模式
        this.render.creatingRectangleLikeElement(
          this.drawType,
          mx,
          my,
          offsetX,
          offsetY
        );
      } else if (this.drawType === "circle") {
        // 绘制圆形模式
        this.render.creatingCircle(mx, my, e);
      } else if (this.drawType === "freedraw") {
        // 自由画笔模式
        this.render.creatingFreedraw(e, event);
      } else if (this.drawType === "arrow") {
        this.render.creatingArrow(mx, my, e);
      } else if (this.drawType === "line") {
        if (
          getTowPointDistance(
            mx,
            my,
            e.clientX,
            this.coordinate.addScrollY(e.clientY)
          ) > 3
        ) {
          this.render.creatingLine(mx, my, e, true);
        }
      }
    } else {
      // 鼠标没有按下状态
      // 图片放置中
      if (this.imageEdit.isReady) {
        this.cursor.hide();
        this.imageEdit.updatePreviewElPos(e.clientX, e.clientY);
      } else if (this.drawType === "selection") {
        if (this.render.hasActiveElements()) {
          // 检测是否划过激活元素的各个收缩手柄
          let handData = "";
          if (
            (handData = this.render.checkInResizeHand(e.clientX, e.clientY))
          ) {
            this.cursor.setResize(handData.hand);
          } else {
            this.checkIsOnElement(e);
          }
        } else {
          // 检测是否划过元素
          this.checkIsOnElement(e);
        }
      } else if (this.drawType === "line") {
        // 线段绘制中
        this.render.creatingLine(null, null, e, false, true);
      }
    }
  }

  // 检测是否滑过元素
  checkIsOnElement(e) {
    let hitElement = this.render.checkIsHitElement(e);
    if (hitElement) {
      this.cursor.setMove();
    } else {
      this.cursor.reset();
    }
  }

  // 复位当前类型到选择模式
  resetCurrentType() {
    if (this.drawType !== "selection") {
      this.drawType = "selection";
      this.emit("currentTypeChange", "selection");
    }
  }

  // 创建新元素完成
  completeCreateNewElement() {
    this.resetCurrentType();
    this.render.completeCreateElement().render();
  }

  // 鼠标松开事件
  onMouseup(e) {
    if (this.imageEdit.isReady) {
      // 图片放置模式
      this.render.creatingImage(e, this.imageEdit.imageData);
      this.completeCreateNewElement();
      this.cursor.reset();
      this.imageEdit.reset();
    } else if (this.drawType === "arrow") {
      // 箭头绘制模式
      this.render.completeCreateArrow(e);
      this.completeCreateNewElement();
    } else if (this.drawType === "line") {
      this.render.completeCreateLine(e, () => {
        this.completeCreateNewElement();
      });
    } else if (this.render.isCreatingElement) {
      // 创建新元素完成
      this.completeCreateNewElement();
    } else if (this.render.isResizing) {
      // 调整元素操作结束
      this.render.endResize();
    }
  }

  // 双击事件
  onDblclick(e) {
    if (this.drawType === "line") {
      // 结束折线绘制
      this.completeCreateNewElement();
    }
  }
}
