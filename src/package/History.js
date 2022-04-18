import { deepCopy } from "./utils";

// 历史记录管理
export default class History {
  constructor(app) {
    this.app = app;
    this.historyStack = [];
    this.length = 0;
    this.index = -1;
  }

  // 添加
  add(data) {
    let prev = this.length > 0 ? this.historyStack[this.length - 1] : null;
    let copyData = deepCopy(data);
    if (copyData === prev) {
      return;
    }
    this.historyStack.push(copyData);
    this.length++;
    this.index = this.length - 1;
    this.emitChange();
  }

  // 后退
  undo() {
    if (this.index <= 0) {
      return;
    }
    this.index--;
    this.shuttle();
  }

  // 前进
  redo() {
    if (this.index >= this.length - 1) {
      return;
    }
    this.index++;
    this.shuttle();
  }

  // 前进后退
  shuttle() {
    let data = this.historyStack[this.index];
    this.app.setData(data);
    this.emitChange();
  }

  // 清空数据
  clear() {
    this.index = -1;
    this.length = 0;
    this.historyStack = [];
    this.emitChange();
  }

  // 触发事件
  emitChange() {
    this.app.emit("shuttle", this.index, this.length);
  }
}
