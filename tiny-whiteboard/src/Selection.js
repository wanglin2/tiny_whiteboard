import { throttle, getElementCorners } from "./utils";
import Rectangle from "./elements/Rectangle";
import Canvas from "./Canvas";
import Coordinate from "./Coordinate";
import MultiSelectElement from "./elements/MultiSelectElement";
import { DRAG_ELEMENT_PARTS } from "./constants";

// 多选类
export default class Selection {
  constructor(app) {
    this.app = app;
    this.canvas = null;
    this.ctx = null;
    // 当前是否正在创建选区中
    this.creatingSelection = false;
    // 当前是否存在多选元素
    this.hasSelection = false;
    // 当前是否正在调整被选中的元素
    this.isResizing = false;
    this.state = this.app.state;
    this.width = this.app.width;
    this.height = this.app.height;
    this.coordinate = new Coordinate(this);
    // 选区矩形
    this.rectangle = new Rectangle(
      {
        type: "rectangle",
        style: {
          strokeStyle: "rgba(9,132,227,0.3)",
          fillStyle: "rgba(9,132,227,0.3)",
        },
      },
      this
    );
    // 被选中的元素的虚拟元素，用于显示拖拽框
    this.multiSelectElement = new MultiSelectElement(
      {
        type: "multiSelectElement",
      },
      this
    );
    this.checkInNodes = throttle(this.checkInNodes, this, 500);
    // 稍微缓解一下卡顿
    this.handleResize = throttle(this.handleResize, this, 16);
    this.init();
    this.bindEvent();
  }

  // 初始化
  init() {
    if (this.canvas) {
      this.app.container.removeChild(this.canvas.el);
    }
    this.width = this.app.width;
    this.height = this.app.height;
    // 创建canvas元素
    this.canvas = new Canvas(this.width, this.height, {
      className: "selection",
    });
    this.ctx = this.canvas.ctx;
    this.app.container.appendChild(this.canvas.el);
  }

  // 监听事件
  bindEvent() {
    this.app.on("change", () => {
      this.state = this.app.state;
      this.multiSelectElement.updateElements(this.app.elements.elementList);
      this.renderSelection();
    });
    this.app.on("scrollChange", () => {
      this.renderSelection();
    });
    this.app.on("zoomChange", () => {
      this.renderSelection();
    });
  }

  // 鼠标按下
  onMousedown(e, event) {
    if (e.originEvent.which !== 1) {
      return;
    }
    this.creatingSelection = true;
    this.rectangle.updatePos(event.mousedownPos.x, event.mousedownPos.y);
  }

  // 鼠标移动
  onMousemove(e, event) {
    if (
      Math.abs(event.mouseOffset.x) <= 10 &&
      Math.abs(event.mouseOffset.y) <= 10
    ) {
      return;
    }
    this.onMove(e, event);
  }

  // 鼠标松开
  onMouseup() {
    this.creatingSelection = false;
    this.rectangle.updateRect(0, 0, 0, 0);
    // 判断是否有元素被选中
    this.hasSelection = this.hasSelectionElements();
    this.multiSelectElement.updateRect();
    this.renderSelection();
    this.emitChange();
  }

  // 复位
  reset() {
    this.setMultiSelectElements([]);
    this.hasSelection = false;
    this.renderSelection();
    this.emitChange();
  }

  // 渲染
  renderSelection() {
    this.canvas.clearCanvas();
    this.ctx.save();
    this.ctx.scale(this.app.state.scale, this.app.state.scale);
    this.rectangle.render();
    this.multiSelectElement.render();
    this.ctx.restore();
  }

  // 鼠标移动事件
  onMove(e, event) {
    this.rectangle.updateSize(event.mouseOffset.x, event.mouseOffset.y);
    this.renderSelection();
    this.checkInElements(e, event);
  }

  // 检测在选区里的节点
  checkInElements(e, event) {
    let minx = Math.min(event.mousedownPos.x, e.clientX);
    let miny = Math.min(event.mousedownPos.y, e.clientY);
    let maxx = Math.max(event.mousedownPos.x, e.clientX);
    let maxy = Math.max(event.mousedownPos.y, e.clientY);
    let selectedElementList = [];
    this.app.elements.elementList.forEach((element) => {
      let rect = getElementCorners(element);
      let _minx = Infinity;
      let _maxx = -Infinity;
      let _miny = Infinity;
      let _maxy = -Infinity;
      rect.forEach(({ x, y }) => {
        if (x < _minx) {
          _minx = x;
        }
        if (x > _maxx) {
          _maxx = x;
        }
        if (y < _miny) {
          _miny = y;
        }
        if (y > _maxy) {
          _maxy = y;
        }
      });
      if (_minx >= minx && _maxx <= maxx && _miny >= miny && _maxy <= maxy) {
        selectedElementList.push(element);
      }
    });
    this.setMultiSelectElements(selectedElementList, true);
    this.app.render.render();
  }

  // 检测指定位置是否在元素调整手柄上
  checkInResizeHand(x, y) {
    return this.multiSelectElement.dragElement.checkPointInDragElementWhere(
      x,
      y
    );
  }

  // 检查是否需要进行元素调整操作
  checkIsResize(x, y, e) {
    if (!this.hasSelection) {
      return false;
    }
    let hand = this.multiSelectElement.dragElement.checkPointInDragElementWhere(
      x,
      y
    );
    if (hand) {
      this.isResizing = true;
      this.multiSelectElement.startResize(hand, e);
      this.app.cursor.setResize(hand);
      return true;
    }
    return false;
  }

  // 进行元素调整操作
  handleResize(...args) {
    if (!this.isResizing) {
      return;
    }
    this.multiSelectElement.resize(...args);
    this.app.render.render();
    this.multiSelectElement.updateRect();
    this.renderSelection();
  }

  // 结束元素调整操作
  endResize() {
    this.isResizing = false;
    this.multiSelectElement.endResize();
  }

  // 为多选元素设置样式
  setSelectedElementStyle(style = {}) {
    if (!this.hasSelectionElements()) {
      return;
    }
    Object.keys(style).forEach((key) => {
      this.getSelectionElements().forEach((element) => {
        element.style[key] = style[key];
      });
    });
    this.app.render.render();
    this.app.emitChange();
  }

  // 删除当前选中的元素
  deleteSelectedElements() {
    this.getSelectionElements().forEach((element) => {
      this.app.elements.deleteElement(element);
    });
    this.selectElements([]);
    this.app.emitChange();
  }

  // 当前是否存在被选中元素
  hasSelectionElements() {
    return this.getSelectionElements().length > 0;
  }

  // 获取当前被选中的元素
  getSelectionElements() {
    return this.multiSelectElement.selectedElementList;
  }

  // 复制当前选中的元素
  async copySelectionElements(pos) {
    let task = this.getSelectionElements().map((element) => {
      return this.app.elements.copyElement(element, true);
    });
    let elements = await Promise.all(task);
    this.setMultiSelectElements(elements);
    // 粘贴到指定位置
    if (pos) {
      this.multiSelectElement.startResize(DRAG_ELEMENT_PARTS.BODY);
      let ox = pos.x - this.multiSelectElement.x - this.multiSelectElement.width / 2;
      let oy = pos.y - this.multiSelectElement.y - this.multiSelectElement.height / 2;
      // 如果开启了网格，那么要坐标要吸附到网格
      let gridAdsorbentPos = this.app.coordinate.gridAdsorbent(ox, oy)
      this.multiSelectElement.resize(null, null, null, gridAdsorbentPos.x, gridAdsorbentPos.y);
      this.multiSelectElement.endResize();
      this.multiSelectElement.updateRect();
    }
    this.app.render.render();
    this.renderSelection();
    this.app.emitChange();
  }

  // 选中指定元素
  selectElements(elements = []) {
    this.hasSelection = elements.length > 0;
    this.setMultiSelectElements(elements);
    this.app.render.render();
    this.renderSelection();
    this.emitChange();
  }

  // 设置选中的元素
  setMultiSelectElements(elements = [], notUpdateRect) {
    this.multiSelectElement.setSelectedElementList(elements);
    if (!notUpdateRect) {
      this.multiSelectElement.updateRect();
    }
  }

  // 触发多选元素变化事件
  emitChange() {
    this.app.emit("multiSelectChange", this.getSelectionElements());
  }
}
