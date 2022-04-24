import BaseElement from "./BaseElement";
import { drawText } from "../utils/draw";
import DragElement from "./DragElement";
import { transformPointOnElement, splitTextLines } from "../utils";
import { checkIsAtRectangleInner } from "../utils/checkHit";

// 文本元素类
export default class Text extends BaseElement {
	constructor(opts = {}, app) {
		super(opts, app);
		// 拖拽元素实例
		this.dragElement = new DragElement(this, this.app, {
			lockRatio: true
		});
		this.text = opts.text || "";
		this.style.fillStyle = opts.style?.fillStyle || "#000";
		this.style.fontSize = opts.style?.fontSize || 18;
		this.style.lineHeightRatio = opts.style?.lineHeightRatio || 1.5;
		this.style.fontFamily = opts.style?.fontFamily || "微软雅黑, Microsoft YaHei";
	}

	// 序列化
	serialize() {
		let base = super.serialize()
		return {
			...base,
			text: this.text
		};
	}

	// 渲染到画布
	render() {
		let { width, height } = this;
		this.warpRender(({ halfWidth, halfHeight }) => {
			// 画布中心点修改了，所以元素的坐标也要相应修改
			drawText(
				this.app.ctx,
				this,
				-halfWidth,
				-halfHeight,
				width,
				height
			)
		});
		// 激活时显示拖拽框
		this.renderDragElement();
	}

	// 检测是否被击中
	isHit(x, y) {
		let rp = transformPointOnElement(x, y, this);
		return checkIsAtRectangleInner(this, rp);
	}

	// 更新包围框
	updateRect(x, y, width, height) {
		let { text, style } = this;
		// 新字号 = 新高度 / 行数
		let fontSize = Math.floor(
			height / splitTextLines(text).length / style.lineHeightRatio
		);
		this.style.fontSize = fontSize;
		super.updateRect(x, y, width, height);
	}
}
