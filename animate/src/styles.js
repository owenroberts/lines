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
		Object.defineProperty(this, "activeStyle", {
			get: () => {
				return this.anim.styles[this.styleIndex];
			},
		});

		this.addButton({
			key: "r", 
			text: "save",
			callback: () => { this.reset(); },
		});

		this.addButton({
			text: "reset",
			callback: () => { this.setDefault(); },
		});

		this.addRef({
			obj: this,
			ref: "styleIndex",
			callback: () => {
				this.updatePropertiesUI();
			}
		});

		this.addRef({
			obj: this.activeStyle,
			ref: "linesInterval",
			range: [1, 10],
		});

		this.addRef({
			obj: this.activeStyle,
			ref: "segmentNum",
			range: [1, 10],
		});

		this.addRef({
			obj: this.activeStyle,
			ref: "jiggleRange",
			range: [0, 10],
		});

		this.addRef({
			obj: this.activeStyle,
			ref: "wiggleRange",
			range: [0, 16],
		});

		this.addRef({
			obj: this.activeStyle,
			ref: "wiggleSpeed",
			range: [0, 8],
			step: 0.05,
		});

		this.addRef({
			obj: this.activeStyle,
			ref: "wiggleSegments",
		});

		this.addRef({
			obj: this.activeStyle,
			ref: "breaks",
		});

		this.addRef({
			obj: this.activeStyle,
			ref: "color",
			type: "UIColor",
		});

		this.addRef({
			obj: this.activeStyle,
			ref: "lineWidth",
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
		this.children.styleIndex.value = styleIndex;

		this.anim.styles.push(style);
		const layer = this.anim.getDrawLayer();
		layer.styleIndex = styleIndex;
	}

	getNewLayer(f) {
		return new Layer({
			styleIndex: this.styleIndex,
			drawingIndex: this.anim.drawings.length - 1,
			startFrame: +f ?? this.anim.currentFrame,
		});
	}

	reset(f) {
		const drawing = this.anim.getCurrentDrawing();
		const layer = this.anim.getDrawLayer();
		let isNewDrawing = drawing ? false : true;
		if (drawing) {
			if (drawing.length > 0) {
				isNewDrawing = true;
			}
		}

		if (isNewDrawing) {
			this.anim.addNewDrawing();
			/* seems repetietive - settings class ... ? */
			this.children.color.addColor(layer.color); // add color to color pallette
			this.anim.layers.push(this.getNewLayer(f));
			// this.ui.panels.data.saveState();
		}  
		
		this.ui.update();
		this.anim.resetDefault();
	}

	setDefault() {
		this.activeStyle.reset();
		this.updatePropertiesUI();
	}

	setProperty(prop, value) {
		this.anim.styles[this.styleIndex][prop] = value;
	}

	updatePropertiesUI() {
		if (this.styleIndex > this.anim.styles.length - 1) {
			this.getNewStyle();
		}
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