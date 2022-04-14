import {
  getTowPointDistance,
  degToRad,
  transformPointOnElement,
  checkPointIsInRectangle,
} from "../utils";
import { CORNERS, DRAG_ELEMENT_PARTS } from "../constants";
import BaseElement from "./BaseElement";
import { drawRect, drawCircle } from "../utils/draw";

// 拖拽元素
export default class DragElement extends BaseElement {
  constructor(element, app) {
    super(
      {
        type: "dragElement",
        notNeedDragElement: true,
      },
      app
    );

    // 样式
    this.style = {
      strokeStyle: "#666", // 线条颜色
      fillStyle: "transparent", // 填充颜色
      lineWidth: "small", // 线条宽度
      lineDash: 0, // 线条虚线大小
      globalAlpha: 1, // 透明度
    };

    // 归属节点
    this.element = element;

    // 标志位
    this.inDragElementPart = "";

    // 和元素的距离
    this.offset = 5;
    // 拖拽手柄尺寸
    this.size = 10;
  }

  // 更新数据
  update() {
    this.x = this.element.x - this.offset;
    this.y = this.element.y - this.offset;
    this.width = this.element.width + this.offset * 2;
    this.height = this.element.height + this.offset * 2;
    this.rotate = this.element.rotate;
  }

  // 渲染
  render() {
    this.update();
    let { width, height } = this;
    this.warpRender(({ halfWidth, halfHeight }) => {
      // 主体
      this.ctx.save();
      this.ctx.setLineDash([5]);
      drawRect(this.ctx, -halfWidth, -halfHeight, width, height);
      this.ctx.restore();
      // 左上角
      drawRect(
        this.ctx,
        -halfWidth - this.size,
        -halfHeight - this.size,
        this.size,
        this.size
      );
      // 右上角
      drawRect(
        this.ctx,
        -halfWidth + this.element.width + this.size,
        -halfHeight - this.size,
        this.size,
        this.size
      );
      // 右下角
      drawRect(
        this.ctx,
        -halfWidth + this.element.width + this.size,
        -halfHeight + this.element.height + this.size,
        this.size,
        this.size
      );
      // 左下角
      drawRect(
        this.ctx,
        -halfWidth - this.size,
        -halfHeight + this.element.height + this.size,
        this.size,
        this.size
      );
      // 旋转按钮
      drawCircle(
        this.ctx,
        -halfWidth + this.element.width / 2 + this.size / 2,
        -halfHeight - this.size * 2,
        this.size
      );
    });
  }

  // 检测一个坐标在拖拽元素的哪个部分上
  checkPointInDragElementWhere(x, y) {
    let part = "";
    // 坐标反向旋转元素的角度
    let rp = transformPointOnElement(x, y, this.element);
    // 在内部
    if (checkPointIsInRectangle(rp.x, rp.y, this.element)) {
      part = DRAG_ELEMENT_PARTS.BODY;
    } else if (
      getTowPointDistance(
        rp.x,
        rp.y,
        this.x + this.width / 2,
        this.y - this.size * 2
      ) <= this.size
    ) {
      // 在旋转按钮
      part = DRAG_ELEMENT_PARTS.ROTATE;
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.TOP_LEFT)) {
      // 在左上角伸缩手柄
      part = DRAG_ELEMENT_PARTS.TOP_LEFT_BTN;
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.TOP_RIGHT)) {
      // 在右上角伸缩手柄
      part = DRAG_ELEMENT_PARTS.TOP_RIGHT_BTN;
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.BOTTOM_RIGHT)) {
      // 在右下角伸缩手柄
      part = DRAG_ELEMENT_PARTS.BOTTOM_RIGHT_BTN;
    } else if (this._checkPointIsInBtn(rp.x, rp.y, CORNERS.BOTTOM_LEFT)) {
      // 在左下角伸缩手柄
      part = DRAG_ELEMENT_PARTS.BOTTOM_LEFT_BTN;
    }
    return (this.inDragElementPart = part);
  }

  // 检测坐标是否在某个拖拽按钮内
  _checkPointIsInBtn(x, y, dir) {
    let _x = 0;
    let _y = 0;
    switch (dir) {
      case CORNERS.TOP_LEFT:
        _x = this.x - this.size;
        _y = this.y - this.size;
        break;
      case CORNERS.TOP_RIGHT:
        _x = this.x + this.width;
        _y = this.y - this.size;
        break;
      case CORNERS.BOTTOM_RIGHT:
        _x = this.x + this.width;
        _y = this.y + this.height;
        break;
      case CORNERS.BOTTOM_LEFT:
        _x = this.x - this.size;
        _y = this.y + this.height;
        break;
      default:
        break;
    }
    return checkPointIsInRectangle(x, y, _x, _y, this.size, this.size);
  }
}
