function Interface(app) {
	let self = this;

	this.panels = {};
	this.interfaces = {}; /* better name for interfaces ?? */

	/* this gets cut */
	this.panelToggles = document.getElementsByClassName("panel-toggle");
	this.togglePanel = function() {
		const parent = this.parentNode;
		if (parent.clientHeight <= 25) {
			parent.style.height = "auto";
			parent.style.flex = "2 50%";
			this.innerHTML = "^";
		} else {
			parent.style.height = 25 + "px";
			parent.style.flex = "1 25%";
			this.innerHTML = "v";
		}
	};

	for (let i = 0; i < this.panelToggles.length; i++) {
		this.panelToggles[i].addEventListener("click", self.togglePanel);
	}

	/* using key command as key for interfaces object,
		this seems specific not extensible?? */

	this.framesPanel = new UI("frames");
	this.plusFrame = new UI("current"); /* plus frame is unsaved drawing frame */
	this.frameNumDisplay = new UIDisplay("frame");
	this.frameElems = new UIList("frame");

	this.interfaces["a"] = new UI("explode", "click", function() {
		app.data.explode(false, false);
	});

	this.interfaces["shift-a"] = new UI("follow", "click", function() {
		app.data.explode(true, false);
	});

	/* this maybe just doesn't work?? */
	this.interfaces["ctrl-a"] = new UI("explode-over", "click", function() {
		app.data.explode(false, true);
	});

	this.interfaces["alt-a"] = new UI("follow-over", "click", function() {
		app.data.explode(true, true);
	});

	/* updates the frame panel representation of frames, sets current frame, sets copy frames */
	this.updateFramesPanel = function() {
		const numFrames = self.frameElems.getLength();
		/* this creates frames that don't already exist
		loop from the num of already made html frames to frames.length */
		if (app.data.frames.length > numFrames) {
			for (let i = numFrames; i < app.data.frames.length; i++) {
				const frmElem = document.createElement("div");
				frmElem.classList.add("frame");
				frmElem.textContent = i;
				/* 
				add drawing nums, do this later after figuring out lines/frames/drawings 
				frmElem.innerHTML = i + "<br>";
				for (let d = 0; d < frames[i].length; d++) {
					frmElem.innerHTML += frames[i][d].d;
				}
				*/
				/* click on frame, set the current frame */
				frmElem.onclick = function(ev) {
					app.draw.currentFrame = app.draw.currentFrameCounter = i;
					self.updateFrameNum();
				};
				/* right click, add/remove from copy frames */
				frmElem.oncontextmenu = function(ev) {
					ev.preventDefault();
					if (!this.classList.toggle("copy")){
						app.data.framesToCopy.splice(app.data.framesToCopy.indexOf(i), 1);
					} else {
						this.classList.add("copy");
						app.data.framesToCopy.push(i);
					}
				};
				/* this is probably only happening here ... */
				this.framesPanel.el.insertBefore(frmElem, self.plusFrame.el);
			}
		} else {
			/* if there are same number of less then frames than frame divs */
			/* this seems to only happen when deleting the current frame so i'm confused.... 
			delete frame should always be the current frame, is there another way to delete frames?  */
			for (let i = numFrames; i > app.data.frames.length; i--){
				/* remove html frame */
				this.frameElems.remove(i-1);
			}
		}
		this.updateFrameNum();
	};

	this.updateFrameNum = function() {
		this.frameNumDisplay.set(app.draw.currentFrame);
		document.getElementById("current").removeAttribute("id"); /* fine for now... */
		if (self.frameElems.els[app.draw.currentFrame])
			self.frameElems.setId("current", app.draw.currentFrame);
		else 
			this.plusFrame.setId("current");
	};
	/* is this interface or drawing... 
		i guess things that reference everything can be interface */
	this.nextFrame = function() {
		app.mouse.isDrawing = false;
		app.data.saveLines();
		if (app.draw.currentFrame < app.data.frames.length) 
			app.draw.currentFrame++;
		self.updateFramesPanel();
	};

	this.prevFrame = function() {
		app.mouse.isDrawing = false;
		app.data.saveLines();
		if (app.draw.currentFrame > 0) 
			app.draw.currentFrame--;
		self.updateFramesPanel();
	};
}