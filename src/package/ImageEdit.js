export default class ImageEdit {
  constructor(ctx, app, selectImageCallback = () => {}) {
    this.ctx = ctx;
    this.app = app;
    this.selectImageCallback = selectImageCallback;
    this.el = null;
    this.onImageSelectChange = this.onImageSelectChange.bind(this);
    this.isReady = false;
    this.previewEl = null;
    this.imageData = null;
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
    this.previewEl.style.left = x - width / 2 + "px";
    this.previewEl.style.top = y - height / 2 + "px";
  }

  // 获取图片宽高
  async getImageSize(url) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => {
        resolve({
          imageObj: img,
          size: {
            width: img.width,
            height: img.height,
          },
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
    let { imageObj, size } = await this.getImageSize(url);
    this.isReady = true;
    this.imageData = {
      url,
      ...size,
      ratio: size.width / size.height,
      imageObj,
    };
    this.selectImageCallback.call(this.app, this.imageData);
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
