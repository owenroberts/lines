function Play() {
	const self = this;

	this.update = function() {
		// self.updateFrames();
		// self.updateFrame();
		lns.ui.timeline.update();
	};

	this.updateFrames = function() {
		const numFrames = lns.anim.endFrame + 1;
		for (let i = 0; i < numFrames; i++) {
			if (!self.panel.frames[i]) {
				const frameBtn = new UIButton({
					type: "frame",
					text: `${i}`,
					key: i,
					callback: function() {
						lns.draw.reset();
						self.setFrame(i);
						lns.ui.update();
					}	
				});
				lns.ui.keys[i] = frameBtn;
				self.panel.frames.append(frameBtn, i);
			}
		}

		const numFrameBtns = self.panel.frames.children.length;
		for (let i = numFrameBtns - 1; i >= numFrames; i--) {
			self.panel.frames.remove(self.panel.frames[i], i);
		}
	};

	this.updateFrame = function() {
		const currentFrame = document.getElementById("current")
		if (currentFrame) currentFrame.removeAttribute("id");
		self.panel.frames.setId('current', lns.anim.currentFrame);
		lns.ui.faces.frameDisplay.value = lns.anim.currentFrame;
	};

	this.setFrame = function(f) {
		if (+f <= lns.anim.endFrame + 1 && +f >= 0) {
			// no before ?? 
			lns.anim.frame = +f;
			lns.draw.layer.startFrame = lns.anim.currentFrame;
			lns.draw.layer.endFrame = lns.anim.currentFrame;
			lns.ui.update();
		}
	}; /* f key */

	// fix for playing animation with nothing in the final frame
	this.checkEnd = function() {
		if (lns.anim.currentFrame == lns.anim.endFrame && 
			!lns.draw.hasDrawing()) 
			self.next(-1);
	};

	/* call before changing a frame */
	this.next = function(args) {

		const dir = args.dir ? args.dir : args;
		const next = lns.anim.currentFrame + dir;
		
		if (lns.anim.isPlaying) lns.ui.faces.play.update();
		lns.draw.isDrawing = false; /* prototype here with render, anim, draw, isActive or something ? */
		
		if (lns.draw.drawing.length > 0) {
			// drawing to save - can add frame
			lns.draw.reset(next);
			lns.anim.frame = next;
		} else {
			// put in reset? 
			if (dir > 0) {
				if (lns.anim.currentFrame < lns.anim.endFrame || 
					lns.draw.hasDrawing()) {
					lns.draw.layer.startFrame = next;
					lns.draw.layer.endFrame = next;	
					lns.anim.frame = next;
				}
			}

			if (dir < 0 && lns.anim.currentFrame > 0) {
				lns.draw.layer.startFrame = next;
				lns.draw.layer.endFrame = next;
				lns.anim.frame = next;
			}
		}

		lns.data.saveState();
		lns.ui.update();
	}; /* e/w key - got to next/previous frame */

	this.plus = function() {
		self.setFrame(lns.anim.endFrame);
		self.next(1);
	}; /* + key */
}