import BaseElement from "./BaseElement";
import DragElement from "./DragElement";
import { getMultiElementRectInfo } from "../utils";

// 用于多选情况下的虚拟元素类
export default class MultiSelectElement extends BaseElement {
  constructor(opts = {}, app) {
    super(opts, app);
    this.renderElements = opts.renderElements;
    // 拖拽元素实例
    this.dragElement = new DragElement(this, this.app);
    // 被选中的元素集合
    this.selectedElementList = [];
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

  // 检测元素是否存在
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
      element.startResize(...args);
    });
  }

  // 调整中
  resize(...args) {
    this.selectedElementList.forEach((element) => {
      console.log(...args);
      element.resize(...args);
    });
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
