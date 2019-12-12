function setupAnimateInterface(ui) {

	ui.toggleRL = function() {
		if (this.isOn) lns.canvas.canvas.parentElement.classList.add('right');
		else lns.canvas.canvas.parentElement.classList.remove('right');
	};

	/* update interface */
	ui.update = function() {
		// console.log('update');
		ui.updateFrames();
		ui.updateFrame();
		ui.layers.update();
		// ui.drawings.update();
		ui.states.update();
	};

	ui.plusFrame = new UIButton({
		text: '+',
		type: "frame",
		callback: function() {
			console.log('plus')
			ui.setFrame(lns.anim.endFrame + 1);
		},
		key: "+"
	});
	ui.keys['+'] = ui.plusFrame; /* just ui.keys['+'] ... */


	// ui.framesPanel = new UIList({ id:"frames" });
	const panel = new UIPanel("frames", "Frames");
	// ui.panels.frames = panel;
	console.log(panel);
	const list = new UICollection({ id: 'frames' });
	// ui.panels.frames.add(list);
	console.log(list);


	ui.updateFrames = function() {
		const numFrames = lns.anim.endFrame + 1;
		// console.log(numFrames);
		for (let i = 0; i < numFrames; i++) {
			if (!list[i]) {
				const frameBtn = new UIButton({
					type: "frame",
					text: `${i}`,
					callback: function() {
						ui.setFrame(i);
						ui.update();
					}	
				});
				list.append(frameBtn, i);
			}
		}
	};

	ui.updateFrame = function() {
		const currentFrame = document.getElementById("current")
		if (currentFrame) currentFrame.removeAttribute("id");
		list[lns.anim.currentFrame].el.id = 'current';
	};


	/* prob need to get rid of the special lns.draw anim ... */

	/* f key */
	ui.setFrame = function(f) {
		if (+f <= lns.anim.endFrame + 1 && +f >= 0) {
			ui.beforeFrame();
			lns.anim.frame = +f;
			// lns.draw.setFrame(+f);
			ui.afterFrame();
		}
	};

	/* updates the frame panel representation of frames,
		sets current frame,
		sets copy frames */
	ui.updateFramesPanel = function() {

		const numFrames = ui.framesPanel.length - 1;
		const animFrames = lns.anim.plusFrame;
		console.log(numFrames, animFrames);
		/* this creates frames that don't already exist, end Frame plus plus frame */
		if (animFrames > numFrames) {
			/* this seems bad ... */
			for (let i = numFrames; i < animFrames; i++) {
				
				const frameBtn = new UIButton({
					type: "frame",
					text: `${i}`,
					callback: function() {
						ui.setFrame(i);
						ui.update();
					}	
				});

				/* right click, add/remove from copy frames 
					class for this? */
				frameBtn.el.oncontextmenu = function(ev) {
					ev.preventDefault();
					lns.data.selectFrame(ev.currentTarget);
				};

				ui.framesPanel.insertBefore(frameBtn, ui.plusFrame);
			}
		} else {
			/* if there are same number of less then frames than frame divs
				delete current frame */
			for (let i = numFrames - 1; i >= animFrames; i--){
				ui.framesPanel.remove(i); /* remove html frame */
			}
		}
		ui.updateFrameNum();
	};

	/* update frame display and current frame */
	ui.updateFrameNum = function() {
		
		// if (document.getElementById("current"))
		// 	document.getElementById("current").removeAttribute("id");
		// if (ui.framesPanel.children[lns.anim.currentFrame]) 
		// 	ui.framesPanel.setId("current", lns.anim.currentFrame);
		// else
		// 	ui.plusFrame.id = "current";
		// ui.faces.frameDisplay.value = lns.anim.currentFrame;
	};

	/* call before changing a frame */
	ui.beforeFrame = function() {
		lns.draw.isDrawing = false; /* prototype here with render, anim, draw, isActive or something ? */
		lns.data.saveLines();
	};

	/* call after changing a frame */
	ui.afterFrame = function() {
		ui.update();
		lns.draw.reset();
	};

	/* e key - go to next frame */
	ui.nextFrame = function() {
		lns.anim.isPlaying = false;
		ui.beforeFrame();
		console.log(lns.anim.currentFrame, lns.anim.endFrame)
		if (lns.anim.currentFrame < lns.anim.endFrame) {
			ui.setFrame(lns.anim.currentFrame + 1);
		}
		ui.afterFrame();
	};

	/* w key - got to previous frame */
	ui.prevFrame = function() {
		lns.anim.isPlaying = false;
		ui.beforeFrame();
		if (lns.anim.currentFrame > 0) 
			ui.setFrame(lns.anim.currentFrame - 1);
		ui.afterFrame();
	};

	['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(key => {
		ui.keys[key] = new UIButton({
			type: "frame",
			key: key,
			callback: function() {
				ui.setFrame(+key);
			}
		});
	});

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
