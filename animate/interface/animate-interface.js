function setupAnimateInterface(ui) {

	ui.toggleRL = function() {
		if (this.isOn) lns.canvas.canvas.parentElement.classList.add('right');
		else lns.canvas.canvas.parentElement.classList.remove('right');
	};

	/* update interface */
	ui.update = function() {
		ui.updateFrames();
		ui.updateFrame();
		ui.layers.update();
		ui.drawings.update();
		ui.states.update(); 
	};

	ui.plus = function() {
		ui.setFrame(lns.anim.endFrame);
		ui.nextFrame();
	}; /* + key */

	// ui.framesPanel = new UIList({ id:"frames" });
	const panel = new UIPanel("frames", "Frames");
	// ui.panels.frames = panel;
	// console.log(panel);
	ui.list = new UIList({ id: 'frames' });
	// ui.panels.frames.add(list);
	// console.log(ui.list);

	ui.updateFrames = function() {
		const numFrames = lns.anim.endFrame + 1;
		for (let i = 0; i < numFrames; i++) {
			if (!ui.list[i]) {
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
				ui.list.append(frameBtn, i);
			}
		}

		const numFrameBtns = ui.list.children.length;
		for (let i = numFrameBtns - 1; i >= numFrames; i--) {
			ui.list.remove(ui.list[i], i);
		}
	};

	ui.updateFrame = function() {
		const currentFrame = document.getElementById("current")
		if (currentFrame) currentFrame.removeAttribute("id");
		ui.list.setId('current', lns.anim.currentFrame);
	};

	ui.setFrame = function(f) {
		if (+f <= lns.anim.endFrame + 1 && +f >= 0) {
			// ui.beforeFrame();
			lns.anim.frame = +f;
			lns.draw.layer.startFrame = lns.anim.currentFrame;
			lns.draw.layer.endFrame = lns.anim.currentFrame;
			// lns.draw.setFrame(+f); - set frame 
			ui.afterFrame();
		}
	}; /* f key */

	// fix for playing animation with nothing in the final frame
	ui.checkEnd = function() {
		if (lns.anim.currentFrame == lns.anim.endFrame && 
			!lns.draw.hasDrawing()) 
			ui.prevFrame();
	};

	/* call before changing a frame */
	ui.beforeFrame = function(dir) {
		lns.draw.isDrawing = false; /* prototype here with render, anim, draw, isActive or something ? */
		
		if (lns.draw.drawing.length > 0) {
			// drawing to save - can add frame
			lns.draw.reset(lns.anim.currentFrame + dir);
			lns.anim.frame = lns.anim.currentFrame + dir;
		} else {
			// put in reset? 
			if (dir > 0) {
				if (lns.anim.currentFrame < lns.anim.endFrame || 
					lns.draw.hasDrawing()) {
					lns.draw.layer.startFrame = lns.anim.currentFrame + dir;
					lns.draw.layer.endFrame = lns.anim.currentFrame + dir;	
					lns.anim.frame = lns.anim.currentFrame + dir;
				}
			}

			if (dir < 0 && lns.anim.currentFrame > 0) {
				lns.draw.layer.startFrame = lns.anim.currentFrame + dir;
				lns.draw.layer.endFrame = lns.anim.currentFrame + dir;
				lns.anim.frame = lns.anim.currentFrame + dir;
			}
		}

		lns.data.saveState();
	};

	/* call after changing a frame */
	ui.afterFrame = function() {
		ui.update();
	};

	/* e key - go to next frame */
	ui.nextFrame = function() {
		lns.anim.isPlaying = false;
		ui.beforeFrame(1);
		ui.afterFrame();
	};

	/* w key - got to previous frame */
	ui.prevFrame = function() {
		lns.anim.isPlaying = false;
		ui.beforeFrame(-1);
		ui.afterFrame();
	};

	ui.updateFIO = function(data, params) {
		/* rename faces to props? also could use module ids 
			this updates a lot more than just the files interface , not the right place */

		// self.title.value = lns.files.fileName.split('/').pop().replace('.json', '');
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
}
