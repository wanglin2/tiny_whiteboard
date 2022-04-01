import {
  degToRad,
  transformPointOnElement,
  getBoundingRect,
  deepCopy,
} from "./utils";
import {
  checkIsAtRectangleEdge,
  getCircleRadius,
  checkIsAtCircleEdge,
  checkIsAtLineEdge,
  checkIsAtFreedrawLineEdge,
  checkIsAtDiamondEdge,
  checkIsAtTriangleEdge
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

  // 绘制所有元素
  render() {
    this.app.clearCanvas();
    this.elementList.forEach((element) => {
      let { x, y, width, height, rotate, type } = element;
      let halfWidth = width / 2
      let halfHeight = height / 2
      // 移动画布中点到元素中心，否则旋转时中心点不对
      let cx = 0;
      let cy = 0;
      cx = x + halfWidth;
      cy = y + halfHeight;
      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(degToRad(rotate));
      // 画布中心点修改了，所以元素的坐标也要相应修改
      switch (type) {
        case "rectangle":
          this.drawShape.drawRect(-halfWidth, -halfHeight, width, height);
          break;
        case "circle":
          this.drawShape.drawCircle(0, 0, getCircleRadius(width, height));
          break;
        case "line":
          this.drawShape.drawLine(
            element.pointArr
              .map((point) => {
                return [point[0] - cx, point[1] - cy];
              })
              .concat(
                // 加上鼠标当前实时位置
                element.pointArr.length > 0 &&
                  this.isCreatingElement &&
                  this.app.currentType === "line"
                  ? [
                      [
                        element.fictitiousPoint.x - cx,
                        element.fictitiousPoint.y - cy,
                      ],
                    ]
                  : []
              )
          );
          break;
        case "freedraw":
          this.drawShape.drawFreeLine(
            element.pointArr.map((point) => {
              return [point[0] - cx, point[1] - cy, ...point.slice(2)];
            })
          );
          break;
        case "diamond":
          this.drawShape.drawDiamond(-halfWidth, -halfHeight, width, height);
          break;
        case "triangle":
          this.drawShape.drawTriangle(-halfWidth, -halfHeight, width, height);
          break;
        default:
          break;
      }
      this.ctx.restore();
    });
    this.app.dragElement.render();
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
    }
    this.addElement(element);
    this.activeElement = element;
    this.isCreatingElement = true;
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
      } 
    });
    return res;
  }

  // 保存激活元素初始状态
  saveActiveElementState() {
    let { rotate, x, y, pointArr, width, height, type } = this.activeElement;
    this.activeElement.startRotate = rotate;
    if (type === "line" || type === "freedraw") {
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
    if (type === "line" || type === "freedraw") {
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
    if (
      this.activeElement.type === "line" ||
      this.activeElement.type === "freedraw"
    ) {
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
