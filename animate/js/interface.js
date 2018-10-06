function Interface() {
	let self = this;

	this.panels = {}; 
	this.keyCommands = {}; /* parts of the interface? */

	this.framesPanel = new UI({id:"frames"});
	this.frameElems = new UIList({class:"frame"});
	/* plus frame is unsaved drawing frame */
	this.plusFrame = new UI({
		id:"current",
		event: "click",
		callback: function() {
			Lines.currentFrame = Lines.frames.length;
			Lines.drawingInterface.resetLayers();
			self.updateFrameNum();
		}
	});
	this.keyCommands['p'] = this.plusFrame; /* can't add key command bc this module doesn't exist yet */

	this.back = new UI({
		id: 'back',
		callback: function() {
			Lines.currentFrame = self.currentFrameCounter = 0;
			Lines.interface.updateFramesPanel();
			Lines.interface.updateFramesPanel();
			Lines.drawingInterface.resetLayers();
		}
	});
	this.keyCommands['backslash'] = this.back;

	/* updates the frame panel representation of frames, 
		sets current frame, 
		sets copy frames */
	this.updateFramesPanel = function() {
		const numFrames = self.frameElems.getLength();
		/* this creates frames that don't already exist
			loop from the num of already made html frames to frames.length */
		if (Lines.frames.length > numFrames) {
			for (let i = numFrames; i < Lines.frames.length; i++) {
				const frmElem = document.createElement("div");
				frmElem.classList.add("frame");
				frmElem.textContent = i;
				frmElem.dataset.index = i;

				/* click on frame, set the current frame */
				frmElem.onclick = function(ev) {
					Lines.currentFrame = Lines.draw.currentFrameCounter = i;
					self.updateFrameNum();
					Lines.drawingInterface.resetLayers();
				};

				/* right click, add/remove from copy frames */
				frmElem.oncontextmenu = function(ev) {
					ev.preventDefault();
					if (!this.classList.toggle("copy")){
						Lines.data.framesToCopy.splice(Lines.data.framesToCopy.indexOf(i), 1);
					} else {
						this.classList.add("copy");
						Lines.data.framesToCopy.push(i);
					}
				};

				/* this is one time un-ui thing */
				this.framesPanel.el.insertBefore(frmElem, self.plusFrame.el);
			}
		} else {
			/* if there are same number of less then frames than frame divs
				delete current frame */
			for (let i = numFrames; i > Lines.frames.length; i--){
				this.frameElems.remove(i-1); /* remove html frame */
			}
		}
		this.updateFrameNum();
	};

	/* update frame display and current frame */
	this.updateFrameNum = function() {
		Lines.drawingInterface.frameNumDisplay.set(Lines.currentFrame);
		if (document.getElementById("current"))
			document.getElementById("current").removeAttribute("id");
		if (self.frameElems.els[Lines.currentFrame]) // also un-ui
			self.frameElems.setId("current", Lines.currentFrame);
		else 
			self.plusFrame.setId("current");
	};
	
	/* e key - go to next frame */
	this.nextFrame = function() {
		Lines.drawEvents.isDrawing = false;
		Lines.data.saveLines();
		if (Lines.currentFrame < Lines.frames.length) 
			Lines.currentFrame++;
		self.updateFramesPanel();
		Lines.drawingInterface.resetLayers();
	};

	/* w key - got to previous frame */
	this.prevFrame = function() {
		Lines.drawEvents.isDrawing = false;
		Lines.data.saveLines();
		if (Lines.currentFrame > 0) 
			Lines.currentFrame--;
		self.updateFramesPanel();
		Lines.drawingInterface.resetLayers();
	};

	/* keyboard events and handlers */
	this.keyDown = function(ev) {
		let k = Cool.keys[ev.which];
		if (k == "space" || k == "tab") 
			ev.preventDefault();
		if (document.activeElement.type != "text") {
			
			if (ev.shiftKey) k = "shift-" + k;
			if (ev.ctrlKey) k = "ctrl-" + k;
			if (ev.altKey) k = "alt-" + k;

			if (self.keyCommands[k]) {
				self.keyCommands[k].callback(ev);
				//  self.keyCommands[k].addClass('key-down'); show key presses?
				if (self.keyCommands[k].toggleText) {
					self.keyCommands[k].toggleText();
				}
			}
		} else if (document.activeElement.id == 'title') {
			if (k == 'enter') {
				Lines.fio.saveFramesToFile();
				document.activeElement.blur();
				
			}
		}
	}
	document.addEventListener("keydown", self.keyDown, false);
}