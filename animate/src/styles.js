/*
	set layer styles
	default style index 0
	use names?

	don"t want to lose basic functionality, when i save some lines and then make changes, it doesn"t effect the lines i just changed

	but only want new style when changing a style ... 
*/

import { randomInt } from "../../../cool/cool.js";
import { UIButton, UIModal, UIColor, UIPanel } from "../../../oi/src/oi.js";
import { Style, Layer } from "../../src/lines.js";

export class StylesPanel extends UIPanel {
	constructor(ui, anim) {
		super({ id: "styles", ui });

		this.anim = anim;

		// not a anim prop bc refers to style of current layer, can change
		// maybe define prop?
		this.styleIndex = 0;

		// set up obj/ref with changing ref
		// why not getter? ***
		Object.defineProperty(this, "activeStyle", {
			get: () => {
				return this.anim.styles[this.styleIndex];
			},
		});

		this.addButtons({}, [
			{
				key: "r", 
				text: "save",
				callback: () => { this.reset(); },
			},
			{
				text: "reset",
				callback: () => { this.setDefault(); },
			}
		]);

		this.addRef({
			obj: this,
			ref: "styleIndex",
			callback: value => { this.setStyleIndex(value); }
		});

		// *** nenver really figued this out huh ...

		this.addRef({
			value: this.activeStyle.linesInterval,
			ref: "linesInterval",
			callback: value => { this.setProperty("linesInterval", value)},
			range: [1, 10],
		});

		this.addRef({
			value: this.activeStyle.segmentNum,
			ref: "segmentNum",
			callback: value => { this.setProperty("segmentNum", value)},
			range: [1, 10],
		});

		this.addRef({
			value: this.activeStyle.jiggleRange,
			ref: "jiggleRange",
			callback: value => { this.setProperty("jiggleRange", value)},
			range: [0, 10],
		});

		this.addRef({
			value: this.activeStyle.wiggleRange,
			ref: "wiggleRange",
			callback: value => { this.setProperty("wiggleRange", value)},
			range: [0, 16],
		});

		this.addRef({
			value: this.activeStyle.wiggleSpeed,
			ref: "wiggleSpeed",
			callback: value => { this.setProperty("wiggleSpeed", value)},
			range: [0, 8],
			step: 0.05,
		});

		this.addRef({
			value: this.activeStyle.wiggleSegments,
			ref: "wiggleSegments",
			callback: value => { this.setProperty("wiggleSegments", value)},
		});

		this.addRef({
			value: this.activeStyle.breaks,
			ref: "breaks",
			callback: value => { this.setProperty("breaks", value)},
		});

		this.addRef({
			value: this.activeStyle.color,
			ref: "color",
			callback: value => { this.setProperty("color", value)},
			type: "UIColor",
		});

		this.addRef({
			value: this.activeStyle.lineWidth,
			ref: "lineWidth",
			callback: value => { this.setProperty("lineWidth", value)},
		});

		this.addBreak();

		this.addButton({ 
			key: "g", 
			text: "color menu",
			callback: () => { this.quickColorSelect(); },
		});

		this.addButton({ 
			key: "shift-g",
			text: "random color",
			callback: () => { this.randomColor(); },
		});

		this.addButton({ 
			key: "alt-g",
			text: "color variation",
			callback: () => { this.colorVariation(); },
		});
	}

	setStyleIndex(value) {
		if (this.styleIndex > this.anim.styles.length - 1) {
			this.getNewStyle();
		}
		this.styleIndex = value;
		this.anim.activeLayer.styleIndex = value;
		this.updateUI();
	}

	getNewStyle() {
		const style = new Style({
			linesInterval: +this.children.linesInterval.value,
			segmentNum: +this.children.segmentNum.value,
			jiggleRange: +this.children.jiggleRange.value,
			wiggleRange: +this.children.wiggleRange.value,
			wiggleSpeed: +this.children.wiggleSpeed.value,
			color: this.children.color.value,
			lineWidth: this.children.lineWidth.value,
		});

		this.children.styleIndex.value = this.styleIndex;
		this.anim.styles.push(style);
		// const layer = this.anim.getDrawLayer();
		this.anim.activeLayer.styleIndex = this.styleIndex;
	}

	getNewLayer(frameIndex) {
		const layer = new Layer({
			styleIndex: this.styleIndex,
			drawingIndex: this.anim.drawings.length - 1,
			startFrame: +frameIndex,
		});
		return layer;
	}

	reset(frameIndex) {
		const drawing = this.anim.activeDrawing;
		let isNewDrawing = drawing ? false : true;
		if (drawing) {
			if (drawing.length > 0) {
				isNewDrawing = true;
			}
		}
		
		if (isNewDrawing) {
			this.anim.addNewDrawing();
			/* seems repetitive - settings class ... ? */
			this.children.color.addColor(this.anim.activeLayer.color); // add color to color pallette
			this.anim.layers.push(this.getNewLayer(frameIndex ?? this.anim.currentFrame));
			this.ui.faces.activeLayerIndex.update(this.anim.layers.length - 1);
			this.ui.panels.data.saveState();
		}  
		
		this.ui.update();
		this.anim.resetDefault();
	}

	setDefault() {
		this.activeStyle.reset();
		this.updateUI();
	}

	setProperty(prop, value) {
		this.anim.styles[this.styleIndex][prop] = value;
	}

	updateUI() {
		const styleProps = this.anim.styles[this.styleIndex].getProps();
		for (const prop in styleProps) {
			if (this.ui.faces[prop]) {
				this.ui.faces[prop].update(styleProps[prop], true); // ui only
			}
		}
	}

	quickColorSelect() {

		const tempColor = this.activeStyle.color;

		const modal = new UIModal({ 
			title: "select color", 
			ui: this.ui,
			callback: () => {
				this.children.color.update(color.value);
			},
			onEscape: () => {
				this.activeStyle.color = tempColor;
			}
		});

		const color = modal.add(new UIColor({
			callback: value => {
				this.activeStyle.color = value;
			}
		}));

		this.ui.faces.color.colors.forEach(color => {
			modal.add(new UIButton({
				text: color,
				css: { background: color },
				value: color,
				callback: () => {
					this.children.color.update(color);
					modal.clear();
				}
			}));
		});
	}

	randomColor() {
		const color = "#" + Math.floor(Math.random()*16777215).toString(16);
		this.children.color.update(color);
	}

	colorVariation() {
		let n = parseInt(this.anim.styles[this.styleIndex].color.substr(1), 16);
		n += randomInt(-500, 500); // wtf 
		n = Math.max(0, n);
		const color = "#" + n.toString(16);
		this.children.color.update(color);
	}

}