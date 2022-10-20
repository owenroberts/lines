/*
	merge with playback / render
*/
function Play(lns) {

	let frameDisplay;

	function setFrame(f) {
		if (+f <= lns.anim.endFrame + 1 && +f >= 0) {
			// no before ?? 
			if (lns.anim.frame !== +f) lns.draw.reset();
			lns.anim.frame = +f;

			lns.draw.layer.startFrame = lns.anim.currentFrame;
			lns.draw.layer.endFrame = lns.anim.currentFrame;

			lns.ui.update();
		} else {
			frameDisplay.update(lns.anim.currentFrame, true);
		}
	}

	// fix for playing animation with nothing in the final frame
	function checkEnd() {
		if (lns.anim.currentFrame === lns.anim.endFrame && !lns.draw.hasDrawing()) {
			next(-1);
		}
	}

	/* call before changing a frame */
	function next(dir) {

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
				if (lns.anim.currentFrame < lns.anim.state.end || 
					(lns.anim.stateName == 'default' && lns.draw.hasDrawing())) {
					lns.draw.layer.startFrame = next;
					lns.draw.layer.endFrame = next;	
					lns.anim.frame = next;
				}
			}

			if (dir < 0 && lns.anim.currentFrame > lns.anim.state.start) {
				lns.draw.layer.startFrame = next;
				lns.draw.layer.endFrame = next;
				lns.anim.frame = next;
			}
		}

		lns.data.saveState();
		lns.ui.update();
	}

	function plus() {
		setFrame(lns.anim.endFrame);
		next(1);
	}

	function connect() {

		lns.ui.addCallbacks([
			{ callback: setFrame, key: '0', text: '0', args: [0] },
			{ callback: next, key: 'w', text: '<', args: [-1] },
			// play btn
			{ callback: next, key: 'e', text: '>', args: [1] },
			{ callback: plus, key: '+', text: '+'}
		], 'play');
	
		frameDisplay = lns.ui.addUI({ 
			type: "UINumberStep",
			callback: setFrame, 
			key: 'f',
			value: 0,
		}, 'play');
	}

	return { connect };
}