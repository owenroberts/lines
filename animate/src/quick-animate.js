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
			
			// add length of animation from end of layer
			// this should account for anims starting middle of layer but fine for default
			layer.endFrame = this.anim.currentFrame + n;

			if (this.anim.clips.current.end < layer.endFrame) {
				this.anim.clips.current.end = layer.endFrame;
			}

			switch(type) {
				case AnimTypes.DRAW:
					layer.addKeyframe({
						prop: "endIndex",
						frames: [
							[
								this.anim.currentFrame, 
								0
							],
							[
								this.anim.currentFrame + n,
								this.anim.drawings[layer.drawingIndex].length - 1,
							]
						],
					});
				break;
				case AnimTypes.REVERSE:
					layer.addKeyframe({
						prop: "startIndex",
						frames: [
							[
								this.anim.currentFrame, 
								0
							],
							[
								this.anim.currentFrame + n,
								this.anim.drawings[layer.drawingIndex].length - 1,
							]
						],
					});
				break;
				case AnimTypes.DRAW_REVERSE:
					const mid = Math.floor(n / 2);
					layer.addKeyframe({
						prop: "endIndex",
						frames: [
							[
								this.anim.currentFrame, 
								0
							],
							[
								this.anim.currentFrame + mid,
								this.anim.drawings[layer.drawingIndex].length - 1,
							]
						],
					});
					layer.addKeyframe({
						prop: "startIndex",
						frames: [
							[
								this.anim.currentFrame + mid,
								0
							],
							[
								this.anim.currentFrame + n,
								this.anim.drawings[layer.drawingIndex].length - 1,
							]
						],
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