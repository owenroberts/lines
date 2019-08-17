class ItemEdit extends Item {
	constructor(params, src, debug) {
		super(params, src, debug);
		
		this.displayLabel = false;
		this.outline = false;
		this.label = params.label;

		this.ui = new EditUI(this.createUI.bind(this), edi.ui.panels.items); /* this is fucked right? */
	}

	display(view) {
		Game.ctx.strokeStyle = '#000000'; // game colors ???
		super.display(this.isInMapBounds(view));

		if (this.displayLabel) this.drawLabel();
		if (this.outline) this.drawOutline();
	}

	isInMapBounds(view) {
		if (this.position.x + this.width > view.x - Game.width/2 &&
			this.position.x < view.x + view.width + Game.width/2 &&
			this.position.y + this.height > view.y - Game.height/2 &&
			this.position.y < view.y + view.height + Game.height/2 ) {
			return true;
		} else {
			return false;
		}
	}

	drawLabel() {
		Game.ctx.fillText(this.label, this.xy.x, this.xy.y);
	}

	drawOutline() {
		Game.ctx.strokeRect(this.xy.x, this.xy.y, this.width, this.height);
		Game.ctx.strokeStyle = this.ui.color; /* ? */
		Game.ctx.beginPath();
		Game.ctx.arc(this.position.x, this.position.y, 5, 0, 2 * Math.PI, false);
		Game.ctx.stroke();
	}

	mouseOver(x, y, zoom) {
		// console.log(this.label);
		if (this.isInMapBounds(zoom.view)) {
			const xy = zoom.translate(x, y);
			if (xy.x > this.xy.x &&
				xy.x < this.xy.x + this.width &&
				xy.y > this.xy.y &&
				xy.y < this.xy.y + this.height) {
				this.displayLabel = true;
				this.outline = true;
				return this;
			} else {
				if (!this.selected) {
					this.displayLabel = false;
					this.outline = false;
					return false;
				}
			}
		}
	}

	/* isSelected ? */
	set selected(select) {
		this._selected = select;
		this.displayLabel = select;
		this.outline = select;
		if (select) this.ui.addUI();
		else this.ui.removeUI();
	}

	get selected() {
		return this._selected;
	}

	update(offset) {
		this.position.add(offset);
		this.ui.update({ x: this.position.x, y: this.position.y });
	}
	

	createUI() {
		const self = this;

		this.ui.uis.label = new UIText({
			title: this.label,
			block: true,
			callback: function(value) {
				self.label = value;
			}
		});
		
		this.ui.uis.x = new UIText({
			label: "x",
			value: self.position.x,
			callback: function(value) {
				self.position.x = +value;
			}
		});

		this.ui.uis.y = new UIText({
			label: "y",
			value: self.position.y,
			callback: function(value) {
				self.position.y = +value;
			}
		});

		this.ui.uis.sceneSelectors = [];

		function addSceneSelector(scene, index) {
			self.ui.uis.sceneSelectors[index] = new UISelect({
				options: Game.scenes,
				selected: scene,
				callback: function(value) {
					self.scenes[index] = value;
				}
			});
			return self.ui.uis.sceneSelectors[index];
		}

		for (let i = 0; i < this.scenes.length; i++) {
			this.ui.uis.sceneSelectors.push(addSceneSelector(this.scenes[i], i));
		}

		this.ui.uis.addScene = new UIButton({
			title: "+ scene",
			callback: function() {
				const s = addSceneSelector(Game.scenes[0], self.scenes.length);
				edi.ui.panels.items.add(s, self.row);
			}
		});

		this.ui.addUI();
	}

	get data() {
		return {
			src: this.animation.src,
			x: this.position.x,
			y: this.position.y,
			states: this.animation.states,
			state: this.animation.state,
			scenes: this.scenes
		};
	}
}