import DragElement from "./DragElement";
import DrawShape from "./DrawShape";
import Elements from "./Elements";
import MouseEvent from "./MouseEvent";
import {
  getTowPointRotate,
  getElementCenterPos,
  transformPointReverseRotate,
  getElementRotatedTopLeftPos,
  getElementRotatedTopRightPos,
  getElementRotatedBottomRightPos,
  getElementRotatedBottomLeftPos,
} from "./utils";
import EventEmitter from "eventemitter3";

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
      this.onMouseup
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

  // 鼠标按下事件
  onMousedown(e, mouseEvent) {
    let mx = mouseEvent.mousedownPos.x;
    let my = mouseEvent.mousedownPos.y;
    // 当前存在选中及拖拽元素
    if (this.dragElement.element) {
      // 检测是否安装了拖拽元素内部
      if (this.dragElement.checkIsInDragElement(mx, my)) {
        this.dragElement.isInElement = true;
        this.dragElement.savePos();
        this.elements.saveActiveElementPos();
      } else if (this.dragElement.checkIsInDragElementRotateBtn(mx, my)) {
        // 检测是否按住了拖拽元素的旋转按钮
        this.dragElement.isInRotateBtn = true;
        this.dragElement.saveRotate();
        this.elements.saveActiveElementRotate();
      } else if (this.dragElement.checkIsInDragElementTopLeftBtn(mx, my)) {
        // 检测是否按住了拖拽元素左上角拖拽手柄
        this.dragElement.isInTopLeftBtn = true;
        let centerPos = getElementCenterPos(this.elements.activeElement);
        let topLeftPos = getElementRotatedTopLeftPos(
          this.elements.activeElement
        );
        // 对角点的坐标
        this.dragElement.diagonalPoint.x = 2 * centerPos.x - topLeftPos.x;
        this.dragElement.diagonalPoint.y = 2 * centerPos.y - topLeftPos.y;
        // 鼠标按下位置和元素的左上角坐标差值
        this.dragElement.mousedownPosAndElementPosOffset.x =
          e.clientX - topLeftPos.x;
        this.dragElement.mousedownPosAndElementPosOffset.y =
          e.clientY - topLeftPos.y;
      } else if (this.dragElement.checkIsInDragElementTopRightBtn(mx, my)) {
        // 检测是否按住了拖拽元素右上角拖拽手柄
        this.dragElement.isInTopRightBtn = true;
        let centerPos = getElementCenterPos(this.elements.activeElement);
        let topRightPos = getElementRotatedTopRightPos(
          this.elements.activeElement
        );
        // 对角点的坐标
        this.dragElement.diagonalPoint.x = 2 * centerPos.x - topRightPos.x;
        this.dragElement.diagonalPoint.y = 2 * centerPos.y - topRightPos.y;
        // 鼠标按下位置和元素的左上角坐标差值
        this.dragElement.mousedownPosAndElementPosOffset.x =
          e.clientX - topRightPos.x;
        this.dragElement.mousedownPosAndElementPosOffset.y =
          e.clientY - topRightPos.y;
      } else if (this.dragElement.checkIsInDragElementBottomRightBtn(mx, my)) {
        // 检测是否按住了拖拽元素右下角拖拽手柄
        this.dragElement.isInBottomRightBtn = true;
        let centerPos = getElementCenterPos(this.elements.activeElement);
        let bottomRightPos = getElementRotatedBottomRightPos(
          this.elements.activeElement
        );
        // 对角点的坐标
        this.dragElement.diagonalPoint.x = 2 * centerPos.x - bottomRightPos.x;
        this.dragElement.diagonalPoint.y = 2 * centerPos.y - bottomRightPos.y;
        // 鼠标按下位置和元素的左上角坐标差值
        this.dragElement.mousedownPosAndElementPosOffset.x =
          e.clientX - bottomRightPos.x;
        this.dragElement.mousedownPosAndElementPosOffset.y =
          e.clientY - bottomRightPos.y;
      } else if (this.dragElement.checkIsInDragElementBottomLeftBtn(mx, my)) {
        // 检测是否按住了拖拽元素左下角拖拽手柄
        this.dragElement.isInBottomLeftBtn = true;
        let centerPos = getElementCenterPos(this.elements.activeElement);
        let bottomRightPos = getElementRotatedBottomLeftPos(
          this.elements.activeElement
        );
        // 对角点的坐标
        this.dragElement.diagonalPoint.x = 2 * centerPos.x - bottomRightPos.x;
        this.dragElement.diagonalPoint.y = 2 * centerPos.y - bottomRightPos.y;
        // 鼠标按下位置和元素的左上角坐标差值
        this.dragElement.mousedownPosAndElementPosOffset.x =
          e.clientX - bottomRightPos.x;
        this.dragElement.mousedownPosAndElementPosOffset.y =
          e.clientY - bottomRightPos.y;
      }
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
        // 按住了拖拽元素内部
        if (this.dragElement.isInElement) {
          this.dragElement.offsetPos(offsetX, offsetY);
          this.elements.offsetActiveElementPos(offsetX, offsetY);
          this.elements.render();
        } else if (this.dragElement.isInRotateBtn) {
          // 按住了拖拽元素的旋转按钮
          // 获取元素中心点
          let centerPos = getElementCenterPos(this.elements.activeElement);
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
        } else if (this.dragElement.isInTopLeftBtn) {
          let actClientX =
            e.clientX - this.dragElement.mousedownPosAndElementPosOffset.x;
          let actClientY =
            e.clientY - this.dragElement.mousedownPosAndElementPosOffset.y;
          // 按住了拖拽元素的左上角伸缩按钮
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
            this.elements.activeElement.rotate
          );
          this.elements.updateActiveElementPos(rp.x, rp.y);
          let newSize = {
            width: (newCenter.x - rp.x) * 2,
            height: (newCenter.y - rp.y) * 2,
          };
          this.elements.updateActiveElementSize(newSize.width, newSize.height);
          this.dragElement.create(this.elements.activeElement);
          this.elements.render();
        } else if (this.dragElement.isInTopRightBtn) {
          let actClientX =
            e.clientX - this.dragElement.mousedownPosAndElementPosOffset.x;
          let actClientY =
            e.clientY - this.dragElement.mousedownPosAndElementPosOffset.y;
          // 按住了拖拽元素的右上角伸缩按钮
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
            this.elements.activeElement.rotate
          );
          let newSize = {
            width: (rp.x - newCenter.x) * 2,
            height: (newCenter.y - rp.y) * 2,
          };
          this.elements.updateActiveElementPos(rp.x - newSize.width, rp.y);
          this.elements.updateActiveElementSize(newSize.width, newSize.height);
          this.dragElement.create(this.elements.activeElement);
          this.elements.render();
        } else if (this.dragElement.isInBottomRightBtn) {
          let actClientX =
            e.clientX - this.dragElement.mousedownPosAndElementPosOffset.x;
          let actClientY =
            e.clientY - this.dragElement.mousedownPosAndElementPosOffset.y;
          // 按住了拖拽元素的右下角伸缩按钮
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
            this.elements.activeElement.rotate
          );
          let newSize = {
            width: (rp.x - newCenter.x) * 2,
            height: (rp.y - newCenter.y) * 2,
          };
          this.elements.updateActiveElementPos(
            rp.x - newSize.width,
            rp.y - newSize.height
          );
          this.elements.updateActiveElementSize(newSize.width, newSize.height);
          this.dragElement.create(this.elements.activeElement);
          this.elements.render();
        } else if (this.dragElement.isInBottomLeftBtn) {
          let actClientX =
            e.clientX - this.dragElement.mousedownPosAndElementPosOffset.x;
          let actClientY =
            e.clientY - this.dragElement.mousedownPosAndElementPosOffset.y;
          // 按住了拖拽元素的左下角伸缩按钮
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
            this.elements.activeElement.rotate
          );
          let newSize = {
            width: (newCenter.x - rp.x) * 2,
            height: (rp.y - newCenter.y) * 2,
          };
          this.elements.updateActiveElementPos(rp.x, rp.y - newSize.height);
          this.elements.updateActiveElementSize(newSize.width, newSize.height);
          this.dragElement.create(this.elements.activeElement);
          this.elements.render();
        }
      }
      // 当前是绘制矩形模式
      else if (this.currentType === "rectangle") {
        // 当前没有激活元素，那么创建一个新元素
        if (!this.elements.activeElement) {
          let element = this.elements.createRectangle(mx, my);
          this.elements.addElement(element);
          this.elements.activeElement = element;
        }
        this.elements.updateActiveElementSize(offsetX, offsetY);
        this.elements.render();
      }
    }
  }

  // 鼠标松开事件
  onMouseup(e, mouseEvent) {
    this.currentType = "selection";
    this.emit("currentTypeChange", "selection");
    // 拖拽操作结束
    let dragElementFlags = [
      "isInElement",
      "isInRotateBtn",
      "isInTopLeftBtn",
      "isInTopRightBtn",
      "isInBottomRightBtn",
      "isInBottomLeftBtn",
    ];
    let isHandleDragElement = false;
    dragElementFlags.forEach((flag) => {
      if (this.dragElement[flag]) {
        isHandleDragElement = true;
        this.dragElement[flag] = false;
      }
    });
    if (!isHandleDragElement) {
      this.elements.activeElement = null;
      // 判断是否选中元素
      let el = this.elements.checkElementsAtPos(e.clientX, e.clientY);
      this.elements.activeElement = el;
      this.dragElement.create(el);
      this.elements.render();
    }
  }
}
