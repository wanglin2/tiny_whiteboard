import EventEmitter from "eventemitter3";
import {
  createCanvas,
  getTowPointDistance,
  throttle,
  getMultiElementRectInfo,
  createImageObj
} from "./utils";
import * as utils from "./utils";
import * as checkHit from "./utils/checkHit";
import * as draw from "./utils/draw";
import Coordinate from "./Coordinate";
import Event from "./Event";
import Elements from "./Elements";
import ImageEdit from "./ImageEdit";
import Cursor from "./Cursor";
import TextEdit from "./TextEdit";
import History from "./History";
import Export from "./Export";
import Background from "./Background";
import Selection from "./Selection";
import Grid from "./Grid";
import Mode from "./Mode";
import KeyCommand from "./KeyCommand";
import Render from './Render';
import { DRAG_ELEMENT_PARTS } from "./constants";
import elements from "./elements";

// 主类
class TinyWhiteboard extends EventEmitter {
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
    // 容器宽高位置信息
    this.width = 0;
    this.height = 0;
    this.left = 0;
    this.top = 0;
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
    // 快捷键类
    this.keyCommand = new KeyCommand(this);
    // 坐标转换类
    this.coordinate = new Coordinate(this);
    // 事件类
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
    // 元素管理类
    this.elements = new Elements(this);
    // 渲染类
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
    // elements类
    ["setActiveElementStyle", "cancelActiveElement"].forEach((method) => {
      this[method] = this.elements[method].bind(this.elements);
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
    // 设置背景
    this.background.set();
    // 设置网格
    if (this.state.showGrid) {
      this.grid.showGrid();
    }
    // 设置模式
    if (this.state.readonly) {
      this.setReadonlyMode();
    }
  }

  // 设置数据，包括状态数据及元素数据
  async setData({ state = {}, elements = [] }, noEmitChange) {
    this.state = state;
    // 图片需要预加载
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type === "image") {
        elements[i].imageObj = await createImageObj(elements[i].url);
      }
    }
    this.helpUpdate();
    this.elements.deleteAllElements().setElements(elements)
    this.render.render();
    if (!noEmitChange) {
      this.emitChange();
    }
  }

  // 初始化画布
  initCanvas() {
    this.getContainerRectInfo();
    // 删除旧的canvas元素
    if (this.canvas) {
      this.container.removeChild(this.canvas);
    }
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
    // 初始化canvas元素
    this.initCanvas();
    // 在新的画布上绘制元素
    this.render.render();
    // 多选画布重新初始化
    this.selection.init();
    // 网格画布重新初始化
    this.grid.init();
    // 重新判断是否渲染网格
    this.grid.renderGrid();
  }

  // 更新状态数据，只是更新状态数据，不会触发重新渲染，如有需要重新渲染或其他操作需要自行调用相关方法
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
    if (this.drawType === "image") {
      this.imageEdit.selectImage();
    }
    // 设置鼠标指针样式
    // 开启橡皮擦模式
    if (this.drawType === "eraser") {
      this.cursor.setEraser();
      this.cancelActiveElement();
    } else if (this.drawType !== "selection") {
      this.cursor.setCrosshair();
    } else {
      this.cursor.reset();
    }
    this.emit("currentTypeChange", this.drawType);
  }

  // 删除当前激活元素
  deleteActiveElement() {
    if (!this.elements.hasActiveElement()) {
      return;
    }
    this.deleteElement(this.elements.activeElement);
  }

  // 删除元素
  deleteElement(element) {
    this.elements.deleteElement(element);
    this.render.render();
    this.emitChange();
  }

  // 删除当前激活或选中的元素
  deleteCurrentElements() {
    // 当前激活元素
    this.deleteActiveElement();
    // 当前选中元素
    this.selection.deleteSelectedElements();
  }

  // 复制粘贴元素
  async copyElement(element, notActive = false, pos) {
    if (!element) {
      return;
    }
    let data = element.serialize();
    // 图片元素需要先加载图片
    if (data.type === "image") {
      data.imageObj = await createImageObj(data.url);
    }
    this.cancelActiveElement();
    this.elements.createElement(
      data,
      (element) => {
        element.startResize(DRAG_ELEMENT_PARTS.BODY);
        if (pos) {
          // 指定了坐标
          element.resize(
            null,
            null,
            null,
            pos.x - element.x,
            pos.y - element.y
          );
        } else {
          element.resize(null, null, null, 20, 20);
        }
        element.isCreating = false;
        if (notActive) {
          element.isActive = false;
        }
        this.elements.isCreatingElement = false;
      },
      this,
      notActive
    );
    this.render.render();
    this.emitChange();
  }

  // 复制粘贴当前元素
  copyCurrentElements() {
    this.elements.copyCurrentElement();
    this.elements.pasteCurrentElement();
  }

  // 清空元素
  empty() {
    this.elements.deleteAllElements();
    this.render.render();
    this.history.clear();
    this.emitChange();
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
      elements: this.elements.elementList.map((element) => {
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
    if (!this.elements.hasElements()) {
      this.scrollTo(0, 0);
      return;
    }
    let { minx, maxx, miny, maxy } = getMultiElementRectInfo(
      this.elements.elementList
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
    if (!this.elements.isCreatingElement && !this.textEdit.isEditing) {
      // 是否击中了某个元素
      let hitElement = this.elements.checkIsHitElement(e);
      // 当前存在激活元素
      if (this.elements.hasActiveElement()) {
        let isResizing = this.elements.checkIsResize(
          event.mousedownPos.unGridClientX,
          event.mousedownPos.unGridClientY,
          e
        );
        // 不在调整元素中
        if (!isResizing) {
          this.elements.setActiveElement(hitElement);
          this.render.render();
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
            this.elements.setActiveElement(hitElement);
            this.render.render();
          }
        } else if (hitElement) {
          // 当前有击中元素
          if (this.drawType === "eraser") {
            // 橡皮擦模式
            this.deleteElement(hitElement);
          } else {
            this.elements.setActiveElement(hitElement);
            this.render.render();
          }
        } else if (this.drawType === 'selection') {
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
          this.elements.handleResize(
            e,
            mx,
            my,
            event.mouseOffset.x,
            event.mouseOffset.y
          );
        }
      } else if (["rectangle", "diamond", "triangle"].includes(this.drawType)) {
        // 类矩形元素绘制模式
        this.elements.creatingRectangleLikeElement(
          this.drawType,
          mx,
          my,
          offsetX,
          offsetY
        );
      } else if (this.drawType === "circle") {
        // 绘制圆形模式
        this.elements.creatingCircle(mx, my, e);
      } else if (this.drawType === "freedraw") {
        // 自由画笔模式
        this.elements.creatingFreedraw(e, event);
      } else if (this.drawType === "arrow") {
        this.elements.creatingArrow(mx, my, e);
      } else if (this.drawType === "line") {
        if (getTowPointDistance(mx, my, e.clientX, e.clientY) > 3) {
          this.elements.creatingLine(mx, my, e, true);
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
        if (this.elements.hasActiveElement()) {
          // 当前存在激活元素
          // 检测是否划过激活元素的各个收缩手柄
          let handData = "";
          if (
            (handData = this.elements.checkInResizeHand(
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
        this.elements.creatingLine(null, null, e, false, true);
      }
    }
  }

  // 检测是否滑过元素
  checkIsOnElement(e) {
    let hitElement = this.elements.checkIsHitElement(e);
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
    this.elements.completeCreateElement();
    this.render.render();
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
      this.elements.creatingImage(e, this.imageEdit.imageData);
      this.completeCreateNewElement();
      this.cursor.reset();
      this.imageEdit.reset();
    } else if (this.drawType === "arrow") {
      // 箭头绘制模式
      this.elements.completeCreateArrow(e);
      this.completeCreateNewElement();
    } else if (this.drawType === "line") {
      this.elements.completeCreateLine(e, () => {
        this.completeCreateNewElement();
      });
    } else if (this.elements.isCreatingElement) {
      // 正在创建元素中
      if (this.drawType === "freedraw") {
        // 自由绘画模式可以连续绘制
        this.elements.completeCreateElement();
        this.elements.setActiveElement();
      } else {
        // 创建新元素完成
        this.completeCreateNewElement();
      }
    } else if (this.elements.isResizing) {
      // 调整元素操作结束
      this.elements.endResize();
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
      let hitElement = this.elements.checkIsHitElement(e);
      if (hitElement) {
        // 编辑文字
        if (hitElement.type === "text") {
          this.elements.editingText(hitElement);
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
    this.elements.completeEditingText();
    this.emitChange();
  }

  // 创建文本元素
  createTextElement(e) {
    this.elements.createElement({
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
TinyWhiteboard.utils = utils;
TinyWhiteboard.checkHit = checkHit;
TinyWhiteboard.draw = draw;
TinyWhiteboard.elements = elements;

export default TinyWhiteboard;
