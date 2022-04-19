import EventEmitter from "eventemitter3";

export default class ImageEdit extends EventEmitter {
  constructor(app) {
    super();
    this.app = app;
    this.el = null;
    this.isReady = false;
    this.previewEl = null;
    this.imageData = null;
    this.maxWidth = 750;
    this.maxHeight = 450;
    this.maxRatio = this.maxWidth / this.maxHeight;
    this.onImageSelectChange = this.onImageSelectChange.bind(this);
  }

  // 复位
  reset() {
    this.el.value = "";
    this.isReady = false;
    document.body.removeChild(this.previewEl);
    this.previewEl = null;
    this.imageData = null;
  }

  // 选择图片
  selectImage() {
    if (!this.el) {
      this.el = document.createElement("input");
      this.el.type = "file";
      this.el.accept = "image/*";
      this.el.style.position = "fixed";
      this.el.style.left = "-999999px";
      this.el.addEventListener("change", this.onImageSelectChange);
      document.body.appendChild(this.el);
    }
    this.el.click();
  }

  // 更新
  updatePreviewElPos(x, y) {
    let width = 100;
    let height = width / this.imageData.ratio;
    if (!this.previewEl) {
      this.previewEl = document.createElement("div");
      this.previewEl.style.position = "fixed";
      this.previewEl.style.width = width + "px";
      this.previewEl.style.height = height + "px";
      this.previewEl.style.backgroundImage = `url('${this.imageData.url}')`;
      this.previewEl.style.backgroundSize = "cover";
      this.previewEl.style.pointerEvents = "none";
      document.body.appendChild(this.previewEl);
    }
    let tp = this.app.coordinate.containerToWindow(x, y);
    this.previewEl.style.left = tp.x - width / 2 + "px";
    this.previewEl.style.top = tp.y - height / 2 + "px";
  }

  // 获取图片宽高
  async getImageSize(url) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        // 图片过大，缩小宽高
        let ratio = img.width / img.height;
        if (img.width > this.maxWidth || img.height > this.maxHeight) {
          if (ratio > this.maxRatio) {
            width = this.maxWidth;
            height = this.maxWidth / ratio;
          } else {
            height = this.maxHeight;
            width = this.maxHeight * ratio;
          }
        }
        resolve({
          imageObj: img,
          size: {
            width: width,
            height: height,
          },
          ratio,
        });
      };
      img.onerror = () => {
        reject();
      };
      img.src = url;
    });
  }

  // 图片选择事件
  async onImageSelectChange(e) {
    let url = await this.getImageUrl(e.target.files[0]);
    let { imageObj, size, ratio } = await this.getImageSize(url);
    this.isReady = true;
    this.imageData = {
      url,
      ...size,
      ratio,
      imageObj,
    };
    this.emit("imageSelectChange", this.imageData);
  }

  // 获取图片url
  async getImageUrl(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject();
      };
      reader.readAsDataURL(file);
    });
  }
}
