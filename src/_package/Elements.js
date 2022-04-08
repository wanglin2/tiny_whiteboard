import {
  transformPointOnElement,
  getBoundingRect,
  deepCopy,
  splitTextLines,
  getMaxFontSizeInWidth,
} from "./utils";
import {
  checkIsAtRectangleEdge,
  checkIsAtCircleEdge,
  checkIsAtLineEdge,
  checkIsAtFreedrawLineEdge,
  checkIsAtDiamondEdge,
  checkIsAtTriangleEdge,
  checkIsAtArrowEdge,
  checkIsAtRectangleInner,
} from "./checkHit";

export default class Elements {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;
    this.drawShape = app.drawShape;
    // 所有元素
    this.elementList = [];
    // 当前激活元素
    this.activeElement = null;
    // 当前正在创建新元素
    this.isCreatingElement = false;
  }

  // 添加元素
  addElement(element) {
    this.elementList.push(element);
  }

  // 删除元素
  deleteElement(element) {
    let index = this.elementList.findIndex((item) => {
      return item === element;
    });
    if (index !== -1) {
      this.elementList.splice(index, 1);
    }
  }

  // 创建元素
  createElement(type, x = 0, y = 0, rotate = 0) {
    let element = {
      type, // 类型
      // 记录初始位置，在拖动时
      startX: 0,
      startY: 0,
      // 实时位置
      x,
      y,
      // 大小
      width: 0,
      height: 0,
      // 记录初始角度，在旋转时
      startRotate: 0,
      // 角度
      rotate,
      // 是否不要渲染
      noRender: false,
      // 样式
      style: {
        strokeStyle: '#000000',
        fillStyle: 'transparent',
        lineWidth: 'small',
        lineDash: 0,
        globalAlpha: 1
      }
    };
    if (type === "line") {
      // 记录初始点位，在拖动时
      element.startPointArr = [];
      // 点位
      element.pointArr = [];
      // 鼠标当前实时位置，用于在绘制时显示线段最后一个点到当前鼠标的虚拟连接线
      element.fictitiousPoint = {
        x: 0,
        y: 0,
      };
      // 记录初始大小，用于缩放时
      element.startWidth = 0;
      element.startHeight = 0;
    } else if (type === "freedraw") {
      // 记录初始点位，在拖动时
      element.startPointArr = [];
      // 点位
      element.pointArr = [[x, y]]; // 第三个数字为线宽
      element.lastLineWidth = -1; // 上一次的线宽
      // 记录初始大小，用于缩放时
      element.startWidth = 0;
      element.startHeight = 0;
    } else if (type === "arrow") {
      // 记录初始点位，在拖动时
      element.startPointArr = [];
      // 点位
      element.pointArr = [];
      // 鼠标当前实时位置，用于在绘制时显示箭头的终点到起点的虚拟连接线
      element.fictitiousPoint = {
        x: 0,
        y: 0,
      };
      // 记录初始大小，用于缩放时
      element.startWidth = 0;
      element.startHeight = 0;
    } else if (type === "text") {
      element.text = "";
      element.style.fillStyle = "#000";
      element.fontSize = 18;
      element.lineHeightRatio = 1.5;
      element.fontFamily = "微软雅黑, Microsoft YaHei";
      element.y -=
        (element.fontSize * element.lineHeightRatio - element.fontSize) / 2 + 8;
    } else if (type === "image") {
      element.url = "";
      element.imageObj = null;
      element.ratio = 1;
    }
    this.addElement(element);
    this.setActiveElement(element);
    this.isCreatingElement = true;
    return element;
  }

  // 检测指定位置的元素
  checkElementsAtPos(x, y) {
    let res = null;
    this.elementList.forEach((element) => {
      if (res) return;
      let rp = transformPointOnElement(x, y, element);
      if (element.type === "rectangle") {
        res = checkIsAtRectangleEdge(element, rp);
      } else if (element.type === "circle") {
        res = checkIsAtCircleEdge(element, rp);
      } else if (element.type === "line") {
        res = checkIsAtLineEdge(element, rp);
      } else if (element.type === "freedraw") {
        res = checkIsAtFreedrawLineEdge(element, rp);
      } else if (element.type === "diamond") {
        res = checkIsAtDiamondEdge(element, rp);
      } else if (element.type === "triangle") {
        res = checkIsAtTriangleEdge(element, rp);
      } else if (element.type === "arrow") {
        res = checkIsAtArrowEdge(element, rp);
      } else if (element.type === "text") {
        res = checkIsAtRectangleInner(element, rp);
      } else if (element.type === "image") {
        res = checkIsAtRectangleInner(element, rp);
      }
    });
    return res;
  }

  // 设置当前激活元素
  setActiveElement(element) {
    this.activeElement = element;
    this.app.emit('activeElementChange', element);
  }

  // 保存激活元素初始状态
  saveActiveElementState() {
    let { rotate, x, y, pointArr, width, height, type } = this.activeElement;
    this.activeElement.startRotate = rotate;
    if (type === "line" || type === "freedraw" || type === "arrow") {
      this.activeElement.startPointArr = deepCopy(pointArr);
      this.activeElement.startWidth = width;
      this.activeElement.startHeight = height;
    } else {
      this.activeElement.startX = x;
      this.activeElement.startY = y;
    }
  }

  // 移动元素
  moveActiveElement(ox, oy) {
    let { type, startX, startY, startPointArr } = this.activeElement;
    if (type === "line" || type === "freedraw" || type === "arrow") {
      this.activeElement.pointArr = startPointArr.map((point) => {
        return [point[0] + ox, point[1] + oy, ...point.slice(2)];
      });
      this.updateActiveELementBoundingRect();
    } else {
      this.activeElement.x = startX + ox;
      this.activeElement.y = startY + oy;
    }
  }

  // 更新激活元素尺寸
  updateActiveElementSize(width, height) {
    this.activeElement.width = width;
    this.activeElement.height = height;
  }

  // 更新激活元素坐标
  updateActiveElementPos(x, y) {
    this.activeElement.x = x;
    this.activeElement.y = y;
  }

  // 更新元素包围框
  updateActiveBoundingRect(x, y, width, height) {
    let { type } = this.activeElement;
    if (type === "line" || type === "freedraw" || type === "arrow") {
      let { startWidth, startHeight, startPointArr } = this.activeElement;
      let scaleX = width / startWidth;
      let scaleY = height / startHeight;
      this.activeElement.pointArr = startPointArr.map((point) => {
        let nx = point[0] * scaleX;
        let ny = point[1] * scaleY;
        return [nx, ny, ...point.slice(2)];
      });
      // 放大后会偏移拖拽元素，所以计算一下元素的新包围框和拖拽元素包围框的差距，然后绘制时整体往回偏移
      let rect = getBoundingRect(this.activeElement.pointArr);
      let offsetX = rect.x - x;
      let offsetY = rect.y - y;
      this.activeElement.pointArr = this.activeElement.pointArr.map((point) => {
        return [point[0] - offsetX, point[1] - offsetY, ...point.slice(2)];
      });
      this.updateActiveElementPos(x, y);
      this.updateActiveElementSize(width, height);
    } else if (type === "text") {
      let { text, lineHeightRatio } = this.activeElement;
      // 计算该限定宽高内最大的字号
      let fontSizeX = getMaxFontSizeInWidth(text, width, this.activeElement);
      let fontSizeY = Math.floor(
        height / splitTextLines(text).length / lineHeightRatio
      );
      this.activeElement.fontSize = Math.min(fontSizeX, fontSizeY);
      this.updateActiveElementPos(x, y);
      this.updateActiveElementSize(width, height);
    } else {
      this.updateActiveElementPos(x, y);
      this.updateActiveElementSize(width, height);
    }
  }

  // 偏移激活元素角度
  offsetActiveElementRotate(or) {
    this.activeElement.rotate = this.activeElement.startRotate + or;
  }

  // 添加坐标，具有多个坐标数据的图形，如线段、自由线
  addActiveElementPoint(x, y, ...args) {
    this.activeElement.pointArr.push([x, y, ...args]);
    this.updateActiveELementBoundingRect();
  }

  // 更新有多个坐标点元素的外包围框
  updateActiveELementBoundingRect() {
    let rect = getBoundingRect(this.activeElement.pointArr);
    this.activeElement.x = rect.x;
    this.activeElement.y = rect.y;
    this.activeElement.width = rect.width;
    this.activeElement.height = rect.height;
  }

  // 更新虚拟坐标点
  updateActiveElementFictitiousPoint(x, y) {
    this.activeElement.fictitiousPoint.x = x;
    this.activeElement.fictitiousPoint.y = y;
  }
}
