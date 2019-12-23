function setupAnimateInterface(ui) {

	ui.toggleRL = function() {
		if (this.isOn) lns.canvas.canvas.parentElement.classList.add('right');
		else lns.canvas.canvas.parentElement.classList.remove('right');
	};

	ui.updateFIO = function(data, params) {

		ui.faces.title.value = lns.files.fileName.split('/').pop().replace('.json', '');
		ui.faces.fps.value = data.fps;

		for (const state in data.s) {
			ui.faces.stateSelector.addOption(state);
		}

		ui.faces.width.value = data.w;
		ui.faces.height.value = data.h;

		lns.anim.layers.forEach(layer => {
			if (layer) {
				ui.faces.c.addColor(layer.c);
				ui.faces.c.value = layer.c;
			}
		});

		if (data.bg) ui.faces.bgColor.value = data.bg;
		ui.update();
	};

	ui.update = function() {
		ui.updateFrames();
		ui.updateFrame();
		ui.layers.update();
		ui.drawings.update();
		ui.states.update(); 
	};

	ui.frames = new UIList({ id: 'frames' });

	ui.updateFrames = function() {
		const numFrames = lns.anim.endFrame + 1;
		for (let i = 0; i < numFrames; i++) {
			if (!ui.frames[i]) {
				const frameBtn = new UIButton({
					type: "frame",
					text: `${i}`,
					key: i,
					callback: function() {
						ui.setFrame(i);
						ui.update();
					}	
				});
				ui.keys[i] = frameBtn;
				ui.frames.append(frameBtn, i);
			}
		}

		const numFrameBtns = ui.frames.children.length;
		for (let i = numFrameBtns - 1; i >= numFrames; i--) {
			ui.frames.remove(ui.frames[i], i);
		}
	};

	ui.updateFrame = function() {
		const currentFrame = document.getElementById("current")
		if (currentFrame) currentFrame.removeAttribute("id");
		ui.frames.setId('current', lns.anim.currentFrame);
	};

	ui.setFrame = function(f) {
		if (+f <= lns.anim.endFrame + 1 && +f >= 0) {
			// no before ?? 
			lns.anim.frame = +f;
			lns.draw.layer.startFrame = lns.anim.currentFrame;
			lns.draw.layer.endFrame = lns.anim.currentFrame;
			ui.update();
		}
	}; /* f key */

	// fix for playing animation with nothing in the final frame
	ui.checkEnd = function() {
		if (lns.anim.currentFrame == lns.anim.endFrame && 
			!lns.draw.hasDrawing()) 
			ui.next(-1);
	};

	/* call before changing a frame */
	ui.next = function(args) {
		
		const next = lns.anim.currentFrame + args.dir;
		
		if (lns.anim.isPlaying) ui.faces.play.update();
		lns.draw.isDrawing = false; /* prototype here with render, anim, draw, isActive or something ? */
		
		if (lns.draw.drawing.length > 0) {
			// drawing to save - can add frame
			lns.draw.reset(next);
			lns.anim.frame = next;
		} else {
			// put in reset? 
			if (args.dir > 0) {
				if (lns.anim.currentFrame < lns.anim.endFrame || 
					lns.draw.hasDrawing()) {
					lns.draw.layer.startFrame = next;
					lns.draw.layer.endFrame = next;	
					lns.anim.frame = next;
				}
			}

			if (args.dir < 0 && lns.anim.currentFrame > 0) {
				lns.draw.layer.startFrame = next;
				lns.draw.layer.endFrame = next;
				lns.anim.frame = next;
			}
		}

		lns.data.saveState();
		ui.update();
	}; /* e/w key - got to next/previous frame */

	ui.plus = function() {
		ui.setFrame(lns.anim.endFrame);
		ui.next(1);
	}; /* + key */
}
