import { Layer } from '../../src/lines.js';
import { UIToggle, UIPanel } from '../../../oi/src/oi.js';

/**
 * toggle existing drawings on and off in frame
 */
export class DrawingsPanel extends UIPanel {
	constructor(ui, anim) {
		super({ id: 'drawings', ui });
		this.anim = anim;
		this.drawingsRow = this.addRow({ id: "drawings" });
	}

	getLayer(drawingIndex) {
	
		const layers = this.anim.layers.filter((layer, index) => index < this.anim.layers.length - 1 && layer.drawingIndex === drawingIndex);

		if (layers.length > 0) {
			// get a layer in the current frame if it exists
			for (let i = 0; i < layers.length; i++) {
				if (layers[i].isInFrame(this.anim.currentFrame)) {
					return layers[i];
				}
			}

			// or get adjacent layer
			for (let i = 0; i < layers.length; i++) {
				if (layers[i].isInFrame(this.anim.currentFrame + 1) || 
					layers[i].isInFrame(this.anim.currentFrame - 1)) {
					return layers[i];
				}
			}

			return layers[0];
		}
		return false;
	}

	update() {
		this.clear();
		// return; // i guess i wasn't really using this ...
		
		// -1 to ignore draw drawing ***
		for (let i = 0; i < this.anim.drawings.length - 1; i++) {
			if (!this.anim.drawings[i]) continue;
			// const drawing = this.anim.drawings[i];
			let layer = this.getLayer(i); /* check for existing layer */
			this.drawingsRow.append(new UIToggle({
				text: i,
				value: layer ? layer.isInFrame(this.anim.currentFrame) : false,
				callback: value => {
					let layer = this.getLayer(i);
					if (value) { /* add */
						if (layer) {
							if (layer.isInFrame(this.anim.currentFrame) ||
								layer.isInFrame(this.anim.currentFrame - 1) ||
								layer.isInFrame(this.anim.currentFrame + 1)) {
								layer.addIndex(this.anim.currentFrame);
							} else {
								const props = layer.getProps();
								props.startFrame = props.endFrame = this.anim.currentFrame;
								this.anim.addLayer(new Layer(props));
							}
						} else {
							// get props
							this.anim.addLayer(new Layer({
								drawingIndex: i,
								styleIndex: this.anim.styles.length - 1,
								startFrame: this.anim.currentFrame,
							}));
						}
					} else { /* remove */
						if (layer) {
							if (layer.isInFrame(this.anim.currentFrame)) {
								const newLayer = layer.removeIndex(this.anim.currentFrame, () => {
									this.anim.removeLayer(layer);
								});
								if (newLayer) this.anim.addLayer(newLayer);
							} 
						} 
					}
					
					this.ui.update();
				}
			}), i);
		}
	}

	clear() {
		this.drawingsRow.clear();
	}
}