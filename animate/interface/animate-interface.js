function animateInterface(ui) {

	Object.defineProperty(lns.anim, 'plusFrame', {
		get: function() { return this.endFrame + 1; }
	}); // get the plus frame, end frame + 1

	ui.framesPanel = new UIList({ id:"frames" });

	ui.rl = new UIToggle({
		id: "right-left",
		onText: "R/L",
		offText: "L/R",
		callback: function() {
			if (this.isOn) lns.canvas.canvas.parentElement.classList.add('right');
			else lns.canvas.canvas.parentElement.classList.remove('right');
		}
	});

	/* update interface */
	ui.update = function() {
		ui.updateFrameNum();
		ui.layers.update();
		ui.drawings.update();
		ui.states.update();
		ui.updateFramesPanel();
	};

	ui.plusFrame = new UIButton({
		id:"current",
		type: "plus",
		callback: function() {
			ui.setFrame(lns.anim.plusFrame);
			/* for beginning no layer -1 state */
			if (lns.anim.currentFrame != lns.anim.plusFrame)
				ui.setFrame(lns.anim.plusFrame);
		},
		key: "+"
	});
	ui.keys['+'] = ui.plusFrame; /* just ui.keys['+'] ... */

	/* f key */
	ui.setFrame = function(f) {
		if (+f <= lns.anim.plusFrame && +f >= 0) {
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
		/* this creates frames that don't already exist, end Frame plus plus frame */
		if (animFrames > numFrames) {
			/* this seems bad ... */
			for (let i = numFrames; i < animFrames; i++) {
				/* should be a ui? */
				const frameBtn = new UIButton({
					type: "frame",
					text: ''+i,
					callback: function() {
						ui.setFrame(i);
						ui.update();
					}	
				})

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
		if (document.getElementById("current"))
			document.getElementById("current").removeAttribute("id");
		if (ui.framesPanel.children[lns.anim.currentFrame]) 
			ui.framesPanel.setId("current", lns.anim.currentFrame);
		else
			ui.plusFrame.id = "current";
		ui.faces.frameDisplay.value = lns.anim.currentFrame;
	};

	/* call before changing a frame */
	ui.beforeFrame = function() {
		lns.draw.isDrawing = false; /* prototype here with render, anim, draw, isActive or something ? */
		lns.data.saveLines();
	};

	ui.layersInFrame = function(n) {
		let inFrame = false;
		for (let i = 0; i < lns.anim.layers.length; i++) {
			if (lns.anim.layers[i].isInFrame(n)) 
				inFrame = true;
		}
		return inFrame;
	};

	/* call after changing a frame */
	ui.afterFrame = function() {
		lns.draw.reset();
		ui.update();
	};

	/* e key - go to next frame */
	ui.nextFrame = function() {
		lns.anim.isPlaying = false;
		ui.beforeFrame();
		if (lns.anim.currentFrame < lns.anim.plusFrame) {
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
}
