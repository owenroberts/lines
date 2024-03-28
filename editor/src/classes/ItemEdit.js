class ItemEdit extends Entity {
	constructor(params, src, debug) {
		super(params, src, debug);
		this.src = params.src || src;
		this.displayLabel = false;
		this.displayOutline = false; // displayOutline
		this.label = params.label;
		this.scenes = params.scenes || ['game'];
		
		this.ui = new ItemEditUI(this, edi.ui.panels.items);

		this.isLoaded = false;
		this.isLocked = false; // move xy
		this.isSelectable = true; // click on it
		this.isSelected = false; 
		this.isRemoved = false; // idk
	}

	display(view) {
		if (!this.isRemoved && this.isLoaded) {
			super.display(this.isInMapBounds(view));
			if (this.displayLabel) this.drawLabel();
			if (this.displayOutline) this.drawOutline();
		}
	}

	isInMapBounds(view) {
		// if (this.debug) console.log(this.x, this.y, this.width, this.height, view)
		if (this.x + this.width > view.x - GAME.halfWidth &&
			this.x < view.x - GAME.halfWidth + view.width &&
			this.y + this.height > view.y - GAME.halfHeight &&
			this.y < view.y - GAME.halfHeight + view.height) {
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
		GAME.ctx.strokeStyle = this.isSelected ? '#000000' : '#7eaba7';
		GAME.ctx.strokeRect(this.x, this.y, this.width, this.height);
		GAME.ctx.strokeStyle = this.ui.color; /* ? */
		GAME.ctx.beginPath();
		GAME.ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
		GAME.ctx.stroke();
	}

	isMouseOver(x, y, zoom) {
		if (this.isInMapBounds(zoom.view) && this.isSelectable && this.isLoaded) {
			const xy = zoom.translate(x, y); // translate mouse coordinates
			if (xy.x > this.x &&
				xy.x < this.x + this.width &&
				xy.y > this.y &&
				xy.y < this.y + this.height) {
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
			this.position[0] += offset[0];
			this.position[1] += offset[1];
			this.ui.update({ x: this.position[0], y: this.position[1] });
		}
	}

	get data() {
		return {
			src: this.src,
			x: this.position[0],
			y: this.position[1],
			scenes: this.scenes
		};
	}

	get settings() {
		return {
			isLoaded: this.isLoaded,
			isLocked: this.isLocked,
			isSelectable: this.isSelectable
		};
	}

	lock(lockState) {
		if (lockState !== undefined) this.isLocked = lockState;
		else this.isLocked = !this.isLocked;
	}
}