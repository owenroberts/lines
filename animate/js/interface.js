function Interface() {
	let self = this;

	this.panels = {};
	this.interfaces = {}; /* better name for interfaces ?? */

	this.framesPanel = new UI({id:"frames"});
	this.plusFrame = new UI({id:"current"}); /* plus frame is unsaved drawing frame */
	this.frameElems = new UIList({class:"frame"});

	/* updates the frame panel representation of frames, sets current frame, sets copy frames */
	this.updateFramesPanel = function() {
		const numFrames = self.frameElems.getLength();
		/* this creates frames that don't already exist
			loop from the num of already made html frames to frames.length */
		if (Lines.data.frames.length > numFrames) {
			for (let i = numFrames; i < Lines.data.frames.length; i++) {
				const frmElem = document.createElement("div");
				frmElem.classList.add("frame");
				frmElem.textContent = i;
				frmElem.dataset.index = i;
				/* 
				add drawing nums, do this later after figuring out lines/frames/drawings 
				frmElem.innerHTML = i + "<br>";
				for (let d = 0; d < frames[i].length; d++) {
					frmElem.innerHTML += frames[i][d].d;
				}
				*/
				/* click on frame, set the current frame */
				frmElem.onclick = function(ev) {
					Lines.draw.currentFrame = Lines.draw.currentFrameCounter = i;
					self.updateFrameNum();
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
				/* this is probably only happening here ... */
				this.framesPanel.el.insertBefore(frmElem, self.plusFrame.el);
				/* not updating length of frame elems, shouldnt that reference still work?  */
			}
		} else {
			/* if there are same number of less then frames than frame divs
				delete current frame, is there another way to delete frames?  */
			for (let i = numFrames; i > Lines.data.frames.length; i--){
				/* remove html frame */
				this.frameElems.remove(i-1);
			}
		}
		this.updateFrameNum();
	};

	this.updateFrameNum = function() {
		Lines.draw.frameNumDisplay.set(Lines.draw.currentFrame);
		if (document.getElementById("current"))
			document.getElementById("current").removeAttribute("id"); /* fine for now... */
		if (self.frameElems.els[Lines.draw.currentFrame])
			self.frameElems.setId("current", Lines.draw.currentFrame);
		else 
			self.plusFrame.setId("current");
	};
	
	this.nextFrame = function() {
		Lines.mouse.isDrawing = false;
		Lines.data.saveLines();
		if (Lines.draw.currentFrame < Lines.data.frames.length) 
			Lines.draw.currentFrame++;
		self.updateFramesPanel();
	};

	this.prevFrame = function() {
		Lines.mouse.isDrawing = false;
		Lines.data.saveLines();
		if (Lines.draw.currentFrame > 0) 
			Lines.draw.currentFrame--;
		self.updateFramesPanel();
	};

	/* keyboard events and handlers */
	this.keyDown = function(ev) {
		//console.log(ev.which);
		// if (ev.which == 9) ev.preventDefault(); // tab
		if (document.activeElement.nodeName != "INPUT") {

			var k = Cool.keys[ev.which];
			if (ev.shiftKey) k = "shift-" + k;
			if (ev.ctrlKey) k = "ctrl-" + k;
			if (ev.altKey) k = "alt-" + k;

			if (Lines.interface.interfaces[k]) {
				Lines.interface.interfaces[k].callback(ev);
				if (Lines.interface.interfaces[k].toggleText) {
					Lines.interface.interfaces[k].toggleText();
				}
			}
		}
	}
	document.addEventListener("keydown", self.keyDown, false);

	const panel = new Panel("keys", "Key commands");
	this.panels["keys"] = panel;

}