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
}