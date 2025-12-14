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

	constructor(anim, ui) {
		super({ id: "styles", ui });

		this.anim = anim;

		// not a anim prop bc refers to style of current layer, can change
		// maybe define prop?
		this.styleIndex = 0;

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
			face: "linesInterval",
			value: this.anim.styles[this.styleIndex].linesInterval,
			range: [1, 10],
			callback: value => { this.setProperty("linesInterval", value); }
		});

		this.addRef({
			face: "segmentNum",
			value: this.anim.styles[this.styleIndex].segmentNum,
			range: [1, 10],
			callback: value => { this.setProperty("segmentNum", value); }
		});

		this.addRef({
			face: "jiggleRange",
			value: this.anim.styles[this.styleIndex].jiggleRange,
			range: [0, 10],
			callback: value => { this.setProperty("jiggleRange", value); }
		});

		this.addRef({
			face: "wiggleRange",
			value: this.anim.styles[this.styleIndex].wiggleRange,
			range: [0, 16],
			callback: value => { this.setProperty("wiggleRange", value); }
		});

		this.addRef({
			face: "wiggleSpeed",
			value: this.anim.styles[this.styleIndex].wiggleSpeed,
			range: [0, 8],
			step: 0.05,
			callback: value => { this.setProperty("wiggleSpeed", value); }
		});

		this.addRef({
			face: "wiggleSegments",
			value: this.anim.styles[this.styleIndex].wiggleSegments,
			callback: value => { this.setProperty("wiggleSegments", value); }
		});

		this.addRef({
			face: "breaks",
			value: this.anim.styles[this.styleIndex].breaks,
			callback: value => { this.setProperty("breaks", value); }
		});

		this.addRef({
			face: "color",
			type: "UIColor",
			value: this.anim.styles[this.styleIndex].color,
			callback: value => { this.setProperty("color", value); }
		});

		this.addRef({
			face: "lineWidth",
			value: this.anim.styles[this.styleIndex].lineWidth,
			callback: value => { this.setProperty("lineWidth", value); }
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
			linesInterval: +this.ui.faces.linesInterval.value,
			segmentNum: +this.ui.faces.segmentNum.value,
			jiggleRange: +this.ui.faces.jiggleRange.value,
			wiggleRange: +this.ui.faces.wiggleRange.value,
			wiggleSpeed: +this.ui.faces.wiggleSpeed.value,
			color: this.ui.faces.color.value,
			lineWidth: this.ui.faces.lineWidth.value,
		});
		this.ui.faces.styleIndex.value = styleIndex;

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
			this.ui.faces.color.addColor(layer.color); // add color to color pallette
			this.anim.layers.push(this.getNewLayer(f));
			// this.ui.panels.data.saveState();
		}  
		
		this.ui.update();
		this.anim.resetDefault();
	}

	setDefault() {
		this.anim.styles[this.styleIndex].reset();
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
		const modal = new UIModal({ 
			title: "select color", 
			ui: this.ui,
		});

		modal.add(new UIColor({
			callback: value => {
				this.setProperty("color", value);
				this.ui.faces.color.el.value = value;
			}
		}));

		this.ui.faces.color.colors.forEach(color => {
			modal.add(new UIButton({
				text: color,
				css: { background: color },
				value: color,
				callback: () => {
					this.setProperty("color", color);
					this.ui.faces.color.el.value = color; // need? move to set property?
					modal.clear();
				}
			}));
		});
	}

	randomColor() {
		const color = "#" + Math.floor(Math.random()*16777215).toString(16);
		this.setProperty("color", color);
		this.ui.faces.color.el.value = color; // need?
	}

	colorVariation() {
		let n = parseInt(this.anim.styles[this.styleIndex].color.substr(1), 16);
		n += randomInt(-500, 500); // wtf 
		n = Math.max(0, n);
		const color = "#" + n.toString(16);
		this.setProperty("color", color);
		this.ui.faces.color.el.value = color; // el ? need ?
	}

}