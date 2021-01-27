class ItemEdit extends Entity {
	constructor(params, src, debug) {
		super(params, src, debug);
		this.origin = params.src || src;
		this.displayLabel = false;
		this.displayOutline = false; // displayOutline
		this.label = params.label;
		this.scenes = params.scenes || ['game'];
		
		this.ui = new ItemEditUI(this, edi.ui.panels.items);

		this.isLocked = false; // move xy
		this.isSelectable = true; // click on it
		this.isSelected = false; 
		this.isRemoved = false; // idk
	}

	display(view) {
		if (!this.isRemoved) {
			super.display(this.isInMapBounds(view));
			if (this.displayLabel) this.drawLabel();
			if (this.displayOutline) this.drawOutline();
		}
	}

	isInMapBounds(view) {
		if (this.xy.x + this.width > view.x - GAME.width/2 &&
			this.xy.x < view.x - GAME.width/2 + view.width &&
			this.xy.y + this.height > view.y - GAME.height/2 &&
			this.xy.y < view.y - GAME.height/2 + view.height) {
			// console.log('draw');
			// console.log((this.xy.x + this.width), (view.x - GAME.width/2));
			return true;
		} else {
			return false;
		}
	}

	drawLabel() {
		GAME.ctx.fillText(this.label, this.xy.x, this.xy.y);
	}

	drawOutline() {
		GAME.ctx.strokeStyle = '#000000';
		GAME.ctx.strokeRect(this.xy.x, this.xy.y, this.width, this.height);
		GAME.ctx.strokeStyle = this.ui.color; /* ? */
		GAME.ctx.beginPath();
		GAME.ctx.arc(this.position.x, this.position.y, 5, 0, 2 * Math.PI, false);
		GAME.ctx.stroke();
	}

	isMouseOver(x, y, zoom) {
		if (this.isInMapBounds(zoom.view) && this.isSelectable) {
			const xy = zoom.translate(x, y); // translate mouse coordinates
			if (xy.x > this.xy.x &&
				xy.x < this.xy.x + this.width &&
				xy.y > this.xy.y &&
				xy.y < this.xy.y + this.height) {
				this.displayLabel = true;
				this.displayOutline = true;
				return this;
			} else {
				if (!this.isSelected) {
					this.displayLabel = false;
					this.displayOutline = false;
					return false;
				}
			}
		}
	}

	/* isSelected ? */
	select(isSelected) {
		this.isSelected = isSelected;
		this.displayLabel = isSelected;
		this.displayOutline = isSelected;
		if (isSelected && !this.ui.added) this.ui.add();
		else if (this.ui.isAdded) this.ui.remove();
	}

	update(offset) {
		if (!this.isLocked) {
			this.position.add(offset);
			this.ui.update({ x: this.position.x, y: this.position.y });
		}
	}

	get data() {
		return {
			src: this.origin,
			x: this.position.x,
			y: this.position.y,
			scenes: this.scenes
		};
	}

	get settings() {
		return { 
			isLocked: this.isLocked,
			isSelectable: this.isSelectable
		};
	}

	lock(lockState) {
		if (lockState !== undefined) this.isLocked = lockState;
		else this.isLocked = !this.isLocked;
	}
}