import BaseElement from "./BaseElement";
import DragElement from "./DragElement";
import {
  getMultiElementRectInfo,
  getElementCenterPoint,
  getTowPointRotate,
} from "../utils";

// 用于多选情况下的虚拟元素类
export default class MultiSelectElement extends BaseElement {
  constructor(opts = {}, app) {
    super(opts, app);
    // 画布元素渲染方法
    this.renderElements = opts.renderElements;
    // 拖拽元素实例
    this.dragElement = new DragElement(this, this.app);
    // 被选中的元素集合
    this.selectedElementList = [];
    // 被选中元素整体的中心点
    this.wholeCenterPos = { x: 0, y: 0 };
  }

  // 设置选中元素
  setSelectedElementList(list) {
    this.selectedElementList.forEach((element) => {
      element.isSelected = false;
    });
    this.selectedElementList = list;
    this.selectedElementList.forEach((element) => {
      element.isSelected = true;
    });
  }

  // 过滤掉被删除的元素
  updateElements(elements) {
    let exists = [];
    this.selectedElementList.forEach((element) => {
      if (elements.includes(element)) {
        exists.push(element);
      }
    });
    this.setSelectedElementList(exists);
  }

  // 计算大小和位置
  updateRect() {
    if (this.selectedElementList.length <= 0) {
      super.updateRect(0, 0, 0, 0);
      return;
    }
    let { minx, maxx, miny, maxy } = getMultiElementRectInfo(
      this.selectedElementList
    );
    super.updateRect(minx, miny, maxx - minx, maxy - miny);
  }

  // 开始调整
  startResize(...args) {
    this.selectedElementList.forEach((element) => {
      if (args[0] === "rotate") {
        // 计算多选元素整体中心点
        this.wholeCenterPos = getElementCenterPoint(this);
      }
      element.startResize(...args);
    });
  }

  // 调整中
  resize(...args) {
    this.selectedElementList.forEach((element) => {
      if (element.dragElement.resizeType === "rotate") {
        // 旋转操作特殊处理
        this.handleRotate(element, ...args);
      } else {
        element.resize(...args);
      }
    });
  }

  // 旋转元素
  handleRotate(element, e, mx, my, offsetX, offsetY) {
    // 获取鼠标移动的角度
    let rotate = getTowPointRotate(
      this.wholeCenterPos.x,
      this.wholeCenterPos.y,
      e.clientX,
      e.clientY,
      mx,
      my
    );
    element.rotateByCenter(
      rotate,
      this.wholeCenterPos.x,
      this.wholeCenterPos.y
    );
  }

  // 结束调整
  endResize() {
    this.selectedElementList.forEach((element) => {
      element.endResize();
    });
  }

  // 渲染到画布
  render() {
    // 显示拖拽框
    if (this.selectedElementList.length > 0) {
      this.renderElements();
      if (this.width <= 0 || this.height <= 0) {
        return;
      }
      this.dragElement.render();
    }
  }
}
