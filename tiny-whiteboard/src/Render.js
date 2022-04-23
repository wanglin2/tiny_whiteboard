import {
    createCanvas,
    getTowPointDistance,
    throttle,
    getMultiElementRectInfo,
    createImageObj
} from "./utils";

// 渲染类
export default class Render {
    constructor(app) {
        this.app = app;
    }

    // 清除画布
    clearCanvas() {
        let { width, height } = this.app;
        this.app.ctx.clearRect(-width / 2, -height / 2, width, height);
        return this;
    }

    // 绘制所有元素
    render() {
        let { state } = this.app;
        // 清空画布
        this.clearCanvas();
        this.app.ctx.save();
        // 整体缩放
        this.app.ctx.scale(state.scale, state.scale);
        // 渲染所有元素
        this.app.elements.elementList.forEach((element) => {
            // 不需要渲染
            if (element.noRender) {
                return;
            }
            element.render();
        });
        this.app.ctx.restore();
        return this;
    }

    // 删除元素
    deleteElement(element) {
        this.app.elements.deleteElement(element);
        this.render();
        this.app.emitChange();
    }

    // 复制粘贴元素
    async copyElement(element, notActive = false, pos) {
        if (!element) {
            return;
        }
        let data = element.serialize();
        // 图片元素需要先加载图片
        if (data.type === "image") {
            data.imageObj = await createImageObj(data.url);
        }
        this.cancelActiveElement();
        this.app.elements.createElement(
            data,
            (element) => {
                element.startResize(DRAG_ELEMENT_PARTS.BODY);
                if (pos) {
                    // 指定了坐标
                    element.resize(
                        null,
                        null,
                        null,
                        pos.x - element.x,
                        pos.y - element.y
                    );
                } else {
                    element.resize(null, null, null, 20, 20);
                }
                element.isCreating = false;
                if (notActive) {
                    element.isActive = false;
                }
                this.app.elements.isCreatingElement = false;
            },
            this,
            notActive
        );
        this.render();
        this.app.emitChange();
    }

    // 删除当前激活元素
    deleteActiveElement() {
        if (!this.app.elements.hasActiveElement()) {
            return;
        }
        this.deleteElement(this.app.elements.activeElement);
    }

    // 删除当前激活或选中的元素
    deleteCurrentElements() {
        // 当前激活元素
        this.deleteActiveElement();
        // 当前选中元素
        this.app.selection.deleteSelectedElements();
    }

    // 为激活元素设置样式
    setActiveElementStyle(style = {}) {
        if (!this.app.elements.hasActiveElement()) {
            return this;
        }
        this.app.elements.setActiveElementStyle(style);
        this.render();
        if (!this.app.elements.isCreatingElement) {
            this.app.emitChange();
        }
        return this;
    }

    // 取消当前激活元素
    cancelActiveElement() {
        if (!this.app.elements.hasActiveElement()) {
            return this;
        }
        this.app.elements.cancelActiveElement();
        this.render();
        return this;
    }

    // 清空元素
    empty() {
        this.app.elements.deleteAllElements();
        this.render();
        this.app.history.clear();
        this.app.emitChange();
    }

    // 放大
    zoomIn(num = 0.1) {
        this.app.updateState({
            scale: this.app.state.scale + num,
        });
        this.render();
        this.app.emit("zoomChange", this.app.state.scale);
    }

    // 缩小
    zoomOut(num = 0.1) {
        this.app.updateState({
            scale: this.app.state.scale - num,
        });
        this.render();
        this.app.emit("zoomChange", this.app.state.scale);
    }

    // 设置指定缩放值
    setZoom(zoom) {
        if (zoom < 0 || zoom > 1) {
            return;
        }
        this.app.updateState({
            scale: zoom,
        });
        this.render();
        this.app.emit("zoomChange", this.app.state.scale);
    }

    // 滚动至指定位置
    scrollTo(scrollX, scrollY) {
        this.app.updateState({
            scrollX,
            scrollY,
        });
        this.render();
        this.app.emit("scrollChange", this.app.state.scrollX, this.app.state.scrollY);
    }

    // 滚动至中心，即回到所有元素的中心位置
    scrollToCenter() {
        if (!this.app.elements.hasElements()) {
            this.scrollTo(0, 0);
            return;
        }
        let { minx, maxx, miny, maxy } = getMultiElementRectInfo(
            this.app.elements.elementList
        );
        let width = maxx - minx;
        let height = maxy - miny;
        this.scrollTo(
            minx - (this.app.width - width) / 2,
            miny - (this.app.height - height) / 2
        );
    }

    // 复制粘贴当前元素
    copyCurrentElements() {
        this.app.elements.copyCurrentElement();
        this.app.elements.pasteCurrentElement();
    }

    // 设置背景颜色
    setBackgroundColor(color) {
        this.app.updateState({
            backgroundColor: color,
        });
        this.app.background.set();
    }
}