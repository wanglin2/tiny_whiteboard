import {
  getFontString,
  splitTextLines,
  getWrapTextActWidth,
  getTextElementSize,
} from "./utils";

export default class TextEdit {
  constructor(ctx, app, onBlurCallback = () => {}) {
    this.ctx = ctx;
    this.app = app;
    this.onBlurCallback = onBlurCallback;
    this.editable = null;
    this.isEdit = false;
    this.onTextInput = this.onTextInput.bind(this);
    this.onTextBlur = this.onTextBlur.bind(this);
  }

  // 创建文本输入框元素
  crateTextInputEl() {
    this.editable = document.createElement("textarea");
    this.editable.dir = "auto";
    this.editable.tabIndex = 0;
    this.editable.wrap = "off";
    this.editable.className = "textInput";
    Object.assign(this.editable.style, {
      position: "fixed",
      display: "block",
      minHeight: "1em",
      backfaceVisibility: "hidden",
      margin: 0,
      padding: 0,
      border: 0,
      outline: 0,
      resize: "none",
      background: "transparent",
      overflow: "hidden",
      whiteSpace: "pre",
    });
    this.editable.addEventListener("input", this.onTextInput);
    this.editable.addEventListener("blur", this.onTextBlur);
    document.body.appendChild(this.editable);
  }

  // 根据当前文字元素的样式更新文本输入框的样式
  updateTextInputStyle() {
    let activeElement = this.app.elements.activeElement;
    if (!activeElement) {
      return;
    }
    let {
      x,
      y,
      width,
      height,
      color,
      fontSize,
      fontFamily,
      text,
      rotate,
      lineHeightRatio,
    } = activeElement;
    this.editable.value = text;
    let styles = {
      font: getFontString(fontSize, fontFamily),
      lineHeight: `${fontSize * lineHeightRatio}px`,
      left: `${x}px`,
      top: `${y}px`,
      color,
      width: Math.max(width, 100) + "px",
      height: height + "px",
      transform: `rotate(${rotate}deg)`,
      //   textAlign,
      //   opacity,
    };
    Object.assign(this.editable.style, styles);
  }

  // 文本输入事件
  onTextInput() {
    let activeElement = this.app.elements.activeElement;
    if (!activeElement) {
      return;
    }
    activeElement.text = this.editable.value;
    let { width, height } = getTextElementSize(activeElement);
    activeElement.width = width;
    activeElement.height = height;
    this.updateTextInputStyle();
  }

  // 文本框失焦事件
  onTextBlur() {
    this.editable.style.display = "none";
    this.editable.value = "";
    this.onBlurCallback.call(this.app);
    this.isEdit = false;
  }

  // 显示文本编辑框
  showTextEdit() {
    if (!this.editable) {
      this.crateTextInputEl();
    } else {
      this.editable.style.display = "block";
    }
    this.updateTextInputStyle();
    this.editable.focus();
    this.editable.select();
    this.isEdit = true;
  }
}
