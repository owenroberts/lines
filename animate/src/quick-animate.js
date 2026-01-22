import { UIPanel } from '../../../oi/src/oi.js';

const AnimTypes = {
	DRAW: "draw",
	REVERSE: "reverse",
	DRAW_REVERSE: "draw_reverse",
}

export class QuickAnimatePanel extends UIPanel {
	constructor(ui, anim) {
		super({ id: "quick-animate", ui });

		this.anim = anim;

		this.addButtons({}, [
			{
				text: "draw",
				key: "a", 
				callback: () => { this.addAnimation(AnimTypes.DRAW); },
			}, 
			{ 
				key: "shift-a", 
				text: "reverse",
				callback: () => { this.addAnimation(AnimTypes.REVERSE); },
			},
			{ 
				key: "ctrl-a", 
				text: "draw + reverse",
				callback: () => { this.addAnimation(AnimTypes.DRAW_REVERSE); },
			}
		]);
	}

	addAnimation(type) {
		this.ui.panels.styles.reset();
		this.ui.panels.data.saveState();
		
		const n = +prompt("number of frames?");
		if (!n) return;

		for (let i = 0; i < this.anim.layers.length - 1; i++) {
			const layer = this.anim.layers[i];
			if (!layer.isInFrame(this.anim.currentFrame)) continue;
			
			// layer.endFrame = this.anim.currentFrame + n; why ?? 

			// why?
			if (this.anim.clips.current.end < layer.endFrame) {
				this.anim.clips.current.end = layer.endFrame;
			}

			switch(type) {
				case AnimTypes.DRAW:
					layer.addTween({
						prop: "endIndex",
						startFrame: this.anim.currentFrame,
						endFrame: this.anim.currentFrame + n,
						startValue: 0,
						endValue: this.anim.drawings[layer.drawingIndex].length
					});
				break;
				case AnimTypes.REVERSE:
					layer.addTween({
						prop: "startIndex",
						startFrame: this.anim.currentFrame,
						endFrame: this.anim.currentFrame + n,
						startValue: 0,
						endValue: this.anim.drawings[layer.drawingIndex].length
					});
				break;
				case AnimTypes.DRAW_REVERSE:
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
			if (this.anim.clips.current.name === "default" && 
				this.anim.clips.current.end < layer.endFrame) {
				this.anim.clips.current.end = layer.endFrame;
			}
		}
		
		this.ui.update();
	}
}