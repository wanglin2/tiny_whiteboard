import EventEmitter from "eventemitter3";
import {
  createCanvas,
  getTowPointDistance,
  throttle,
  getMultiElementRectInfo,
} from "./utils";
import Coordinate from "./Coordinate";
import Event from "./Event";
import Render from "./Render";
import ImageEdit from "./ImageEdit";
import Cursor from "./Cursor";
import TextEdit from "./TextEdit";
import History from "./History";
import Export from "./Export";
import Background from "./Background";
import Selection from "./Selection";
import Grid from "./Grid";
import Mode from "./Mode";
import { DRAG_ELEMENT_PARTS } from "./constants";

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
    this.getContainerRectInfo();
    // 主要的渲染canvas元素
    this.canvas = null;
    // canvas绘制上下文
    this.ctx = null;
    // 画布状态
    this.state = {
      scale: 1, // 缩放
      scrollX: 0, // 水平方向的滚动偏移量
      scrollY: 0, // 垂直方向的滚动偏移量
      scrollStep: 50, // 滚动步长
      backgroundColor: "", // 背景颜色
      showGrid: false, // 是否显示网格
      readonly: false, // 是否是只读模式
      gridConfig: {
        size: 20, // 网格大小
        strokeStyle: "#dfe0e1", // 网格线条颜色
        lineWidth: 1, // 网格线条宽度
      },
      ...(opts.state || {}),
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
    this.event.on("mousewheel", this.onMousewheel, this);
    // 图片选择类
    this.imageEdit = new ImageEdit(this);
    this.imageEdit.on("imageSelectChange", this.onImageSelectChange, this);
    // 文字编辑类
    this.textEdit = new TextEdit(this);
    this.textEdit.on("blur", this.onTextInputBlur, this);
    // 鼠标样式类
    this.cursor = new Cursor(this);
    // 历史记录管理类
    this.history = new History(this);
    // 导入导出类
    this.export = new Export(this);
    // 背景设置类
    this.background = new Background(this);
    // 多选类
    this.selection = new Selection(this);
    // 网格类
    this.grid = new Grid(this);
    // 模式类
    this.mode = new Mode(this);
    // 实例化渲染类
    this.render = new Render(this);

    // 代理
    this.proxy();
    this.checkIsOnElement = throttle(this.checkIsOnElement, this);

    this.emitChange();
    this.helpUpdate();
  }

  // 代理各个类的方法到实例上
  proxy() {
    // history类
    ["undo", "redo"].forEach((method) => {
      this[method] = this.history[method].bind(this.history);
    });
    // render类
    ["setActiveElementStyle"].forEach((method) => {
      this[method] = this.render[method].bind(this.render);
    });
    // 导入导出类
    ["exportImage", "exportJson"].forEach((method) => {
      this[method] = this.export[method].bind(this.export);
    });
    // 多选类
    ["setSelectedElementStyle"].forEach((method) => {
      this[method] = this.selection[method].bind(this.selection);
    });
    // 网格类
    ["showGrid", "hideGrid", "updateGrid"].forEach((method) => {
      this[method] = this.grid[method].bind(this.grid);
    });
    // 模式类
    ["setEditMode", "setReadonlyMode"].forEach((method) => {
      this[method] = this.mode[method].bind(this.mode);
    });
  }

  // 获取容器尺寸位置信息
  getContainerRectInfo() {
    let { width, height, left, top } = this.container.getBoundingClientRect();
    this.width = width;
    this.height = height;
    this.left = left;
    this.top = top;
  }

  // 必要的重新渲染
  helpUpdate() {
    this.background.set();
    if (this.state.showGrid) {
      this.grid.showGrid();
    }
    if (this.state.readonly) {
      this.setReadonlyMode();
    }
  }

  // 设置数据，包括状态数据及元素数据
  async setData({ state = {}, elements = [] }, noEmitChange) {
    this.state = state;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type === "image") {
        elements[i].imageObj = await this.createImageObj(elements[i].url);
      }
    }
    this.helpUpdate();
    this.render.deleteAllElements().setElements(elements).render();
    if (!noEmitChange) {
      this.emitChange();
    }
  }

  // 初始化画布
  initCanvas() {
    // 创建canvas元素
    let { canvas, ctx } = createCanvas(this.width, this.height, {
      className: "main",
    });
    this.canvas = canvas;
    this.ctx = ctx;
    this.container.appendChild(this.canvas);
  }

  // 容器尺寸调整
  resize() {
    this.getContainerRectInfo();
    this.event.unbindEvent();
    this.container.removeChild(this.canvas);
    this.initCanvas();
    this.event.bindEvent();
    this.render.render();
    this.selection.init();
    this.grid.init();
    this.grid.renderGrid();
  }

  // 更新状态数据
  updateState(data = {}) {
    this.state = {
      ...this.state,
      ...data,
    };
    this.emitChange();
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
    // 开启橡皮擦模式
    if (drawType === "eraser") {
      this.cursor.setEraser();
      this.clearActiveElements();
    } else if (drawType !== "selection") {
      this.cursor.setCrosshair();
    } else {
      this.cursor.reset();
    }
    this.emit("currentTypeChange", drawType);
  }

  // 清除当前激活元素
  clearActiveElements() {
    if (!this.render.hasActiveElements()) {
      return;
    }
    this.render.clearActiveElements().render();
  }

  // 删除元素
  deleteElement(element) {
    this.render.deleteElement(element).render();
    this.emitChange();
  }

  // 复制元素
  async copyElement(element, notActive = false) {
    if (!element) {
      return;
    }
    let data = element.serialize();
    // 图片元素需要先加载图片
    if (data.type === "image") {
      data.imageObj = await this.createImageObj(data.url);
    }
    this.render.clearActiveElements();
    this.render.createElement(
      data,
      (element) => {
        element.startResize(DRAG_ELEMENT_PARTS.BODY);
        element.resize(null, null, null, 20, 20);
        element.isCreating = false;
        if (notActive) {
          element.isActive = false;
        }
        this.render.isCreatingElement = false;
      },
      this,
      notActive
    );
    this.render.render();
    this.emitChange();
  }

  // 清空元素
  empty() {
    this.render.deleteAllElements().render();
    this.history.clear();
    this.emitChange();
  }

  // 创建图片对象
  createImageObj(url) {
    return new Promise((resolve) => {
      let img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = url;
    });
  }

  // 放大
  zoomIn(num = 0.1) {
    this.updateState({
      scale: this.state.scale + num,
    });
    this.render.render();
    this.emit("zoomChange", this.state.scale);
  }

  // 缩小
  zoomOut(num = 0.1) {
    this.updateState({
      scale: this.state.scale - num,
    });
    this.render.render();
    this.emit("zoomChange", this.state.scale);
  }

  // 设置指定缩放值
  setZoom(zoom) {
    if (zoom < 0 || zoom > 1) {
      return;
    }
    this.updateState({
      scale: zoom,
    });
    this.render.render();
    this.emit("zoomChange", this.state.scale);
  }

  // 设置背景颜色
  setBackgroundColor(color) {
    this.updateState({
      backgroundColor: color,
    });
    this.background.set();
  }

  // 获取数据，包括状态数据及元素数据
  getData() {
    return {
      state: {
        ...this.state,
      },
      elements: this.render.elementList.map((element) => {
        return element.serialize();
      }),
    };
  }

  // 滚动至指定位置
  scrollTo(scrollX, scrollY) {
    this.updateState({
      scrollX,
      scrollY,
    });
    this.render.render();
    this.emit("scrollChange", this.state.scrollX, this.state.scrollY);
  }

  // 滚动至中心，即回到所有元素的中心位置
  scrollToCenter() {
    let { minx, maxx, miny, maxy } = getMultiElementRectInfo(
      this.render.elementList
    );
    let width = maxx - minx;
    let height = maxy - miny;
    this.scrollTo(
      minx - (this.width - width) / 2,
      miny - (this.height - height) / 2
    );
  }

  // 图片选择事件
  onImageSelectChange() {
    this.cursor.hide();
  }

  // 鼠标按下事件
  onMousedown(e, event) {
    if (this.state.readonly) {
      // 只读模式下即将进行整体拖动
      this.mode.onStart();
      return;
    }
    if (!this.render.isCreatingElement && !this.textEdit.isEditing) {
      // 是否击中了某个元素
      let hitElement = this.render.checkIsHitElement(e);
      // 当前存在激活元素
      if (this.render.hasActiveElements()) {
        let isResizing = this.render.checkIsResize(
          event.mousedownPos.unGridClientX,
          event.mousedownPos.unGridClientY,
          e
        );
        // 不在调整元素中
        if (!isResizing) {
          this.render.setActiveElements(hitElement).render();
        }
      } else {
        // 当前没有激活元素
        if (this.selection.hasSelection) {
          // 当前存在多选元素
          let isResizing = this.selection.checkIsResize(
            event.mousedownPos.unGridClientX,
            event.mousedownPos.unGridClientY,
            e
          );
          // 不在调整元素中
          if (!isResizing) {
            this.selection.reset();
            this.render.setActiveElements(hitElement).render();
          }
        } else if (hitElement) {
          // 当前有击中元素
          if (this.drawType === "eraser") {
            // 橡皮擦模式
            this.deleteElement(hitElement);
          } else {
            this.render.setActiveElements(hitElement).render();
          }
        } else {
          // 多选创建选区操作
          this.selection.onMousedown(e, event);
        }
      }
    }
  }

  // 鼠标移动事件
  onMousemove(e, event) {
    if (this.state.readonly) {
      if (event.isMousedown) {
        // 只读模式下进行整体拖动
        this.mode.onMove(e, event);
      }
      return;
    }
    // 鼠标按下状态
    if (event.isMousedown) {
      let mx = event.mousedownPos.x;
      let my = event.mousedownPos.y;
      let offsetX = Math.max(event.mouseOffset.x, 0);
      let offsetY = Math.max(event.mouseOffset.y, 0);
      // 选中模式
      if (this.drawType === "selection") {
        if (this.selection.isResizing) {
          // 多选调整元素中
          this.selection.handleResize(
            e,
            mx,
            my,
            event.mouseOffset.x,
            event.mouseOffset.y
          );
        } else if (this.selection.creatingSelection) {
          // 多选创建选区中
          this.selection.onMousemove(e, event);
        } else {
          // 检测是否是正常的激活元素的调整操作
          this.render.handleResize(
            e,
            mx,
            my,
            event.mouseOffset.x,
            event.mouseOffset.y
          );
        }
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
        if (getTowPointDistance(mx, my, e.clientX, e.clientY) > 3) {
          this.render.creatingLine(mx, my, e, true);
        }
      }
    } else {
      // 鼠标没有按下状态
      // 图片放置中
      if (this.imageEdit.isReady) {
        this.cursor.hide();
        this.imageEdit.updatePreviewElPos(
          e.originEvent.clientX,
          e.originEvent.clientY
        );
      } else if (this.drawType === "selection") {
        if (this.render.hasActiveElements()) {
          // 当前存在激活元素
          // 检测是否划过激活元素的各个收缩手柄
          let handData = "";
          if (
            (handData = this.render.checkInResizeHand(
              e.unGridClientX,
              e.unGridClientY
            ))
          ) {
            this.cursor.setResize(handData.hand);
          } else {
            this.checkIsOnElement(e);
          }
        } else if (this.selection.hasSelection) {
          // 多选中检测是否可进行调整元素
          let hand = this.selection.checkInResizeHand(
            e.unGridClientX,
            e.unGridClientY
          );
          if (hand) {
            this.cursor.setResize(hand);
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
    if (this.state.readonly) {
      return;
    }
    if (this.drawType === "text") {
      // 文字编辑模式
      if (!this.textEdit.isEditing) {
        this.createTextElement(e);
        this.resetCurrentType();
      }
    } else if (this.imageEdit.isReady) {
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
      // 正在创建元素中
      if (this.drawType === "freedraw") {
        // 自由绘画模式可以连续绘制
        this.render.completeCreateElement();
        this.render.setActiveElements();
      } else {
        // 创建新元素完成
        this.completeCreateNewElement();
      }
    } else if (this.render.isResizing) {
      // 调整元素操作结束
      this.render.endResize();
      this.emitChange();
    } else if (this.selection.creatingSelection) {
      // 多选选区操作结束
      this.selection.onMouseup(e);
    } else if (this.selection.isResizing) {
      // 多选元素调整结束
      this.selection.endResize();
      this.emitChange();
    }
  }

  // 双击事件
  onDblclick(e) {
    if (this.drawType === "line") {
      // 结束折线绘制
      this.completeCreateNewElement();
    } else {
      // 是否击中了某个元素
      let hitElement = this.render.checkIsHitElement(e);
      if (hitElement) {
        // 编辑文字
        if (hitElement.type === "text") {
          this.render.editingText(hitElement);
        }
      } else {
        // 双击空白处新增文字
        if (!this.textEdit.isEditing) {
          this.createTextElement(e);
        }
      }
    }
  }

  // 文本框失焦事件
  onTextInputBlur() {
    this.render.completeEditingText();
    this.emitChange();
  }

  // 创建文本元素
  createTextElement(e) {
    this.render.createElement({
      type: "text",
      x: e.clientX,
      y: e.clientY,
    });
    this.textEdit.showTextEdit();
  }

  // 鼠标滚动事件
  onMousewheel(dir) {
    let stepNum = this.state.scrollStep / this.state.scale;
    let step = dir === "down" ? stepNum : -stepNum;
    this.scrollTo(this.state.scrollX, this.state.scrollY + step);
  }

  // 触发更新事件
  emitChange() {
    let data = this.getData();
    this.history.add(data);
    this.emit("change", data);
  }
}
