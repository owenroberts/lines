class TextureEdit extends Texture {
	constructor(params, debug) {
		super(params, debug);
		if (params.src) this.src = params.src;
		this.scenes = params.scenes || ['game'];
		this.label = params.label;

		this.isLoaded = false;
		this.isLocked = false;
		this.isSelectable = true;
		this.isRemoved = false;

		this.ui = new TextureEditUI(this, edi.ui.panels.items);
	}

	addAnimation(animation) {
		this.animation = animation;
		this.addLocations();
	}

	addLocation(x, y) {
		if (this.locations.length > this.animation.endFrame) alert('End of indexes');
		else super.addLocation(x, y, this.locations.length);
	}

	display(view) {
		if (!this.isRemoved && this.isLoaded) {
			for (let i = 0; i < this.locations.length; i++) {
				let x = this.locations[i].x;
				let y = this.locations[i].y;
				if (this.isInMapBounds(view, x, y, this.animation.width, this.animation.height)) {
					if (this.center) {
						x -= this.animation.width / 2;
						y -= this.animation.height / 2;
					}

					if (this.locations[i].i !== undefined) 
						this.animation.state = `f-${this.locations[i].i}`;
					this.animation.draw(x, y, GAME.suspend);
					if (this.locations[i].isSelected || this.locations[i].isMoused) {
						this.drawLabel(x, y, i);
						this.drawOutline(x, y);
					}

					// if (this.locations[i].isSelected) {}
				}
			}
		}
	}

	drawLabel(x, y, i) {
		GAME.ctx.fillText(`${this.label} ${i}`, x, y);
	}

	drawOutline(x, y) {
		GAME.ctx.strokeStyle = '#000000';
		GAME.ctx.strokeRect(x, y, this.animation.width, this.animation.height);
		GAME.ctx.strokeStyle = this.ui.color; /* ? */
		GAME.ctx.beginPath();
		GAME.ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
		GAME.ctx.stroke();
	}

	isInMapBounds(view, x, y, width, height) {
		if (x + width > view.x - GAME.width/2 &&
			x < view.x - GAME.width/2 + view.width &&
			y + height > view.y - GAME.height/2 &&
			y < view.y - GAME.height/2 + view.height ) {
			return true;
		} else {
			return false;
		}
	}

	isMouseOver(x, y, zoom) {
		if (this.isSelectable && this.isLoaded) {
			let returnSprite = false;
			for (let i = 0; i < this.locations.length; i++) {
				const location = this.locations[i];
				if (this.isInMapBounds(zoom.view, location.x, location.y, this.animation.width, this.animation.height)) {
					const xy = zoom.translate(x, y);
					if (xy.x > location.x &&
						xy.x < location.x + this.animation.width &&
						xy.y > location.y &&
						xy.y < location.y + this.animation.height) {
					 	location.isMoused = true;
						// return this;
						if (!returnSprite) returnSprite = this;
					} else {
						if (!location.isSelected) {
							location.isMoused = false;
						}
					}
				}
			}
			return returnSprite;
		}
	}

	select(isSelected, shift) {
		if (isSelected) {
			this.locations.filter(loc => loc.isMoused).forEach(loc => {
				if (!shift && loc.isSelected && !loc.isMoused) loc.isSelected = false;
				else loc.isSelected = true;
				loc.isMoused = false;
			});
		} else {
			this.locations.forEach(loc => {
				loc.isSelected = false;
				loc.isMoused = false;
			});
		}
		
		if (isSelected && !this.ui.isAdded) this.ui.add();
		if (!isSelected && this.ui.isAdded) this.ui.remove();
	}

	get isSelected() {
		return this.locations.filter(loc => loc.isSelected).length > 0;
	}

	update(offset) {
		if (!this.isLocked) {
			this.locations.filter(loc => loc.isSelected).forEach(loc => {
				loc.x += offset.x;
				loc.y += offset.y;
			});
		}
	}

	get data() {
		return {
			src: this.src,
			locations: this.locations.map(l => { return { x: l.x, y: l.y } }),
			scenes: this.scenes,
			tags: this.tags // ?
		};
	}

	get settings() {
		return {
			isLoaded: this.isLoaded,
			isLocked: this.isLocked,
			isSelectable: this.isSelectable
		};
	}

	lock() {
		this.isLocked = !this.isLocked;
	}
}