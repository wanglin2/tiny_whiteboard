import DragElement from "./DragElement";
import DrawShape from "./DrawShape";
import Elements from "./Elements";
import MouseEvent from "./MouseEvent";
import {
  getTowPointRotate,
  getElementCenterPoint,
  transformPointReverseRotate,
  getElementRotatedCornerPoint,
  getTowPointDistance,
} from "./utils";
import EventEmitter from "eventemitter3";
import { CORNERS, DRAG_ELEMENT_PARTS } from "./constants";

export default class App extends EventEmitter {
  constructor() {
    super();
    this.wrapEl = null;
    this.canvasEl = null;
    this.currentType = "";
    this.ctx = null;
    this.elements = null;
    this.drawShape = null;
    this.dragElement = null;
    this.mouseEvent = null;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
  }

  // 初始化
  init(wrapEl, canvasEl, currentType) {
    this.wrapEl = wrapEl;
    this.canvasEl = canvasEl;
    this.currentType = currentType;
    // 获取绘图上下文
    this.ctx = this.canvasEl.getContext("2d");
    let { width, height } = this.wrapEl.getBoundingClientRect();
    this.canvasWidth = width;
    this.canvasHeight = height;
    // 设置显示大小（css像素）
    this.canvasEl.style.width = width + "px";
    this.canvasEl.style.height = height + "px";
    let scale = window.devicePixelRatio; // 在视网膜屏幕上更改为1，可以看到模糊的画布
    this.canvasEl.width = Math.floor(width * scale);
    this.canvasEl.height = Math.floor(height * scale);
    // 规范化坐标系以使用css像素
    this.ctx.scale(scale, scale);

    // 鼠标事件类
    this.mouseEvent = new MouseEvent(
      this,
      this.onMousedown,
      this.onMousemove,
      this.onMouseup,
      this.onDblclick
    );
    // 绘制图形类
    this.drawShape = new DrawShape(this.ctx, this);
    // 元素类
    this.elements = new Elements(this.ctx, this);
    // 拖拽元素类
    this.dragElement = new DragElement(this.ctx, this);
  }

  // 更新当前类型
  updateCurrentType(currentType) {
    this.currentType = currentType;
  }

  // 清除画布
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  // 清除当前激活元素
  clearActive() {
    this.elements.activeElement = null;
    this.dragElement.delete();
    this.elements.render();
  }

  // 处理按下拖拽元素四个伸缩手柄事件
  handleDragElementCornerMousedown(e, corner) {
    let centerPos = getElementCenterPoint(this.dragElement.element);
    let pos = getElementRotatedCornerPoint(this.dragElement.element, corner);
    // 对角点的坐标
    this.dragElement.diagonalPoint.x = 2 * centerPos.x - pos.x;
    this.dragElement.diagonalPoint.y = 2 * centerPos.y - pos.y;
    // 鼠标按下位置和元素的左上角坐标差值
    this.dragElement.mousedownPosAndElementPosOffset.x = e.clientX - pos.x;
    this.dragElement.mousedownPosAndElementPosOffset.y = e.clientY - pos.y;
    this.elements.saveActiveElementState();
  }

  // 鼠标按下事件
  onMousedown(e, mouseEvent) {
    let mx = mouseEvent.mousedownPos.x;
    let my = mouseEvent.mousedownPos.y;
    // 当前存在选中及拖拽元素
    if (this.dragElement.element) {
      // 按住了拖拽元素的某个部分
      let isInDragElement = this.dragElement.checkPointInDragElementWhere(
        mx,
        my
      );
      if (isInDragElement === DRAG_ELEMENT_PARTS.BODY) {
        // 检测是否安装了拖拽元素内部
        this.dragElement.savePos();
        this.elements.saveActiveElementState();
      } else if (isInDragElement === DRAG_ELEMENT_PARTS.ROTATE) {
        // 检测是否按住了拖拽元素的旋转按钮
        this.dragElement.saveRotate();
        this.elements.saveActiveElementState();
      } else if (isInDragElement === DRAG_ELEMENT_PARTS.TOP_LEFT_BTN) {
        // 检测是否按住了拖拽元素左上角拖拽手柄
        this.handleDragElementCornerMousedown(e, CORNERS.TOP_LEFT);
      } else if (isInDragElement === DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN) {
        // 检测是否按住了拖拽元素右上角拖拽手柄
        this.handleDragElementCornerMousedown(e, CORNERS.TOP_RIGHT);
      } else if (isInDragElement === DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN) {
        // 检测是否按住了拖拽元素右下角拖拽手柄
        this.handleDragElementCornerMousedown(e, CORNERS.BOTTOM_RIGHT);
      } else if (isInDragElement === DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN) {
        // 检测是否按住了拖拽元素左下角拖拽手柄
        this.handleDragElementCornerMousedown(e, CORNERS.BOTTOM_LEFT);
      }
    }
  }

  // 移动元素整体
  handleMoveElement(offsetX, offsetY) {
    this.dragElement.offsetPos(offsetX, offsetY);
    this.elements.moveActiveElement(offsetX, offsetY);
    this.elements.render();
  }

  // 旋转元素
  handleRotateElement(e, mx, my) {
    // 获取元素中心点
    let centerPos = getElementCenterPoint(this.elements.activeElement);
    // 获取鼠标移动的角度
    let rotate = getTowPointRotate(
      centerPos.x,
      centerPos.y,
      e.clientX,
      e.clientY,
      mx,
      my
    );
    this.dragElement.offsetRotate(rotate);
    this.elements.offsetActiveElementRotate(rotate);
    this.elements.render();
  }

  // 伸缩元素
  handleStretchElement(e, calcSize, calcPos) {
    let actClientX =
      e.clientX - this.dragElement.mousedownPosAndElementPosOffset.x;
    let actClientY =
      e.clientY - this.dragElement.mousedownPosAndElementPosOffset.y;
    // 新的中心点
    let newCenter = {
      x: (actClientX + this.dragElement.diagonalPoint.x) / 2,
      y: (actClientY + this.dragElement.diagonalPoint.y) / 2,
    };
    // 获取当前鼠标位置经新的中心点反向旋转元素的角度后的坐标
    let rp = transformPointReverseRotate(
      actClientX,
      actClientY,
      newCenter.x,
      newCenter.y,
      this.dragElement.element.rotate
    );
    let newSize = calcSize(newCenter, rp);
    let newPos = calcPos(rp, newSize);
    let activeElementNewInfo = this.dragElement.getElPosAndSizeFromDragElement(
      newPos.x,
      newPos.y,
      newSize.width,
      newSize.height
    );
    this.elements.updateActiveBoundingRect(
      activeElementNewInfo.x,
      activeElementNewInfo.y,
      activeElementNewInfo.width,
      activeElementNewInfo.height
    );
    this.dragElement.create(this.elements.activeElement);
    this.elements.render();
  }

  // 处理选择类型下的鼠标移动事件
  handleSelectionTypeMove(e, mx, my, offsetX, offsetY) {
    let inDragElementPart = this.dragElement.inDragElementPart;
    // 按住了拖拽元素内部
    if (inDragElementPart === DRAG_ELEMENT_PARTS.BODY) {
      this.handleMoveElement(offsetX, offsetY);
    } else if (inDragElementPart === DRAG_ELEMENT_PARTS.ROTATE) {
      // 按住了拖拽元素的旋转按钮
      this.handleRotateElement(e, mx, my);
    } else if (inDragElementPart === DRAG_ELEMENT_PARTS.TOP_LEFT_BTN) {
      // 按住左上角伸缩元素
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (newCenter.x - rp.x) * 2,
            height: (newCenter.y - rp.y) * 2,
          };
        },
        (rp, newSize) => {
          return {
            x: rp.x,
            y: rp.y,
          };
        }
      );
    } else if (inDragElementPart === DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN) {
      // 按住右上角伸缩元素
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (rp.x - newCenter.x) * 2,
            height: (newCenter.y - rp.y) * 2,
          };
        },
        (rp, newSize) => {
          return {
            x: rp.x - newSize.width,
            y: rp.y,
          };
        }
      );
    } else if (inDragElementPart === DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN) {
      // 按住右下角伸缩元素
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (rp.x - newCenter.x) * 2,
            height: (rp.y - newCenter.y) * 2,
          };
        },
        (rp, newSize) => {
          return {
            x: rp.x - newSize.width,
            y: rp.y - newSize.height,
          };
        }
      );
    } else if (inDragElementPart === DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN) {
      // 按住左下角伸缩元素
      this.handleStretchElement(
        e,
        (newCenter, rp) => {
          return {
            width: (newCenter.x - rp.x) * 2,
            height: (rp.y - newCenter.y) * 2,
          };
        },
        (rp, newSize) => {
          return {
            x: rp.x,
            y: rp.y - newSize.height,
          };
        }
      );
    }
  }

  // 鼠标移动事件
  onMousemove(e, mouseEvent) {
    // 鼠标按下状态
    if (mouseEvent.isMousedown) {
      let mx = mouseEvent.mousedownPos.x;
      let my = mouseEvent.mousedownPos.y;
      let offsetX = mouseEvent.mouseOffset.x;
      let offsetY = mouseEvent.mouseOffset.y;

      // 当前是选中模式
      if (this.currentType === "selection") {
        this.handleSelectionTypeMove(e, mx, my, offsetX, offsetY);
      } else if (this.currentType === "rectangle") {
        // 当前是绘制矩形模式
        // 当前没有激活元素，那么创建一个新元素
        if (!this.elements.activeElement) {
          this.elements.createElement("rectangle", mx, my);
        }
        this.elements.updateActiveElementSize(offsetX, offsetY);
        this.elements.render();
      } else if (this.currentType === "circle") {
        // 当前是绘制正圆模式
        // 当前没有激活元素，那么创建一个新元素
        if (!this.elements.activeElement) {
          this.elements.createElement("circle", mx, my);
        }
        let radius = getTowPointDistance(e.clientX, e.clientY, mx, my);
        this.elements.updateActiveElementSize(radius * 2, radius * 2);
        this.elements.render();
      } else if (this.currentType === "freedraw") {
        // 当前是自由画笔模式
        // 当前没有激活元素，那么创建一个新元素
        if (!this.elements.activeElement) {
          this.elements.createElement("freedraw", mx, my);
        }
        // 计算画笔粗细
        let lineWidth = this.drawShape.computedLineWidthBySpeed(
          mouseEvent.speed,
          this.elements.activeElement.lastLineWidth
        );
        this.elements.activeElement.lastLineWidth = lineWidth;
        this.elements.addActiveElementPoint(e.clientX, e.clientY, lineWidth);
        // 绘制自由线不重绘，采用增量绘制，否则会卡顿
        this.drawShape.drawLineSegment(
          mouseEvent.lastPos.x,
          mouseEvent.lastPos.y,
          e.clientX,
          e.clientY,
          lineWidth
        );
      } else if (this.currentType === "diamond") {
        // 当前是绘制菱形模式
        // 当前没有激活元素，那么创建一个新元素
        if (!this.elements.activeElement) {
          this.elements.createElement("diamond", mx, my);
        }
        this.elements.updateActiveElementSize(offsetX, offsetY);
        this.elements.render();
      }
    } else {
      // 鼠标没有按下
      if (this.currentType === "line") {
        if (this.elements.activeElement) {
          this.elements.updateActiveElementFictitiousPoint(
            e.clientX,
            e.clientY
          );
          this.elements.render();
        }
      }
    }
  }

  // 检测是否选中元素
  checkIsActiveElement(e) {
    // 判断是否选中元素
    let el = this.elements.checkElementsAtPos(e.clientX, e.clientY);
    this.elements.activeElement = el;
    this.dragElement.create(el);
    this.elements.render();
  }

  // 复位当前类型到选择模式
  resetCurrentType() {
    if (this.currentType !== "selection") {
      this.currentType = "selection";
      this.emit("currentTypeChange", "selection");
    }
  }

  // 创建新元素完成
  completeCreateNewElement() {
    this.elements.isCreatingElement = false;
    this.dragElement.reset();
    this.dragElement.create(this.elements.activeElement);
    this.elements.render();
  }

  // 鼠标松开事件
  onMouseup(e) {
    if (this.currentType === "line") {
      // 当前是绘制线段模式
      // 当前没有激活元素，那么创建一个新元素
      if (!this.elements.activeElement) {
        this.elements.createElement("line");
      }
      this.elements.addActiveElementPoint(e.clientX, e.clientY);
      this.elements.updateActiveElementFictitiousPoint(e.clientX, e.clientY);
      this.elements.render();
    } else {
      // 创建新元素完成
      if (this.elements.isCreatingElement) {
        if (this.currentType === "freedraw") {
          // 自由绘画模式可以连续绘制
          this.elements.activeElement = null;
        } else {
          this.resetCurrentType();
          this.completeCreateNewElement();
        }
      } else if (this.dragElement.inDragElementPart) {
        // 拖拽操作结束
        this.dragElement.inDragElementPart = "";
      } else {
        // 其他情况下单击
        this.elements.activeElement = null;
        this.checkIsActiveElement(e);
      }
    }
  }

  // 鼠标双击事件
  onDblclick() {
    if (this.currentType === "line") {
      this.resetCurrentType();
      this.completeCreateNewElement();
    }
  }
}
