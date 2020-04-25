function Play() {
	const self = this;

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
				if (lns.anim.currentFrame < lns.anim.currentState.end  || 
					(lns.anim.state == 'default' && lns.draw.hasDrawing())) {
					lns.draw.layer.startFrame = next;
					lns.draw.layer.endFrame = next;	
					lns.anim.frame = next;
				}
			}

			if (dir < 0 && lns.anim.currentFrame > lns.anim.currentState.start) {
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