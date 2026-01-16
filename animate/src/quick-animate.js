import { UIPanel } from '../../../oi/src/oi.js';

export class QuickAnimatePanel extends UIPanel {
	constructor(ui, anim) {
		super({ id: "quick-animate", ui });

		this.anim = anim;

		this.addButton({ 
			text: "draw",
			key: "a", 
			callback: () => { this.addAnimation("Draw"); },
		});

		this.addButton({ 
			key: "shift-a", 
			text: "reverse",
			callback: () => { this.addAnimation("Reverse"); },
		});

		this.addButton({ 
			key: "ctrl-a", 
			text: "draw + reverse",
			callback: () => { this.addAnimation("DrawReverse"); },
		});
	}

	addAnimation(type) {
		this.ui.panels.styles.reset();
		this.ui.panels.data.saveState();
		
		const n = +prompt("number of frames?");
		if (!n) return;

		for (let i = 0; i < this.anim.layers.length - 1; i++) {
			const layer = this.anim.layers[i];
			if (!layer.isInFrame(this.anim.currentFrame)) continue;
			layer.endFrame = this.anim.currentFrame + n;
			if (this.anim.state.end < layer.endFrame) this.anim.state.end = layer.endFrame;

			switch(type) {
				case "Draw":
					layer.addTween({
						prop: "endIndex",
						startFrame: this.anim.currentFrame,
						endFrame: this.anim.currentFrame + n,
						startValue: 0,
						endValue: this.anim.drawings[layer.drawingIndex].length
					});
				break;
				case "Reverse":
					layer.addTween({
						prop: "startIndex",
						startFrame: this.anim.currentFrame,
						endFrame: this.anim.currentFrame + n,
						startValue: 0,
						endValue: this.anim.drawings[layer.drawingIndex].length
					});
				break;
				case "DrawReverse":
					const mid = Math.floor(n / 2);
					layer.addTween({
						prop: "endIndex",
						startFrame: this.anim.currentFrame,
						endFrame: this.anim.currentFrame + mid,
						startValue: 0,
						endValue: this.anim.drawings[layer.drawingIndex].length
					});
					layer.addTween({
						prop: "startIndex",
						startFrame: this.anim.currentFrame + mid,
						endFrame: this.anim.currentFrame + n,
						startValue: 0,
						endValue: this.anim.drawings[layer.drawingIndex].length
					});
				break;
			}

			// reset end of anim
			if (this.anim.stateName === "default" && this.anim.state.end < layer.endFrame) {
				this.anim.state.end = layer.endFrame;
			}
		}
		
		this.ui.update();
	}
}