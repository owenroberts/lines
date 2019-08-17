class Item extends Sprite {
	constructor(params, src, debug) {
		super(params.x, params.y);
		this.debug = debug;

		if (debug) console.log(params);

		this.displayLabel = false;
		this.outline = false;
		this.label = params.label;
		this.src = src || params.src;
		if (this.src) {
			const self = this;
			self.addAnimation(self.src);
			self.animation.states = params.states || { idle: { start: 0, end: 0 } };
			self.animation.state = params.state || 'idle';
		} else {
			this.animation = new Animation();
		}

		this.scenes = params.scenes;
		this.center = params.center || true;

		this.ui = {};
		this.uiAdded = false;

		this.uiColor = '#ff00ff';
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
		Game.ctx.strokeStyle = this.uiColor;
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
		if (select) this.addUI();
		else this.removeUI();
	}

	get selected() {
		return this._selected;
	}

	updatePosition(x, y) {
		this.position.x += Math.round(x);
		this.position.y += Math.round(y);
		if (this.ui.x) this.ui.x.setValue(this.position.x);
		if (this.ui.y) this.ui.y.setValue(this.position.y);
	}

	addUI() {
		if (!this.row) this.row = edi.ui.panels.items.addRow();
		if (this.ui.label && !this.uiAdded) {
			this.uiAdded = true;
			for (const key in this.ui) {
				const ui = this.ui[key];
				if (Array.isArray(ui)) {
					for (let i = 0; i < ui.length; i++) {
						edi.ui.panels.items.add(ui[i], this.row);
					}
				} else {
					edi.ui.panels.items.add(ui, this.row);
				}
			}
		} else if (!this.ui.label) {
			this.createUI();
		}
	}

	createUI() {
		const self = this;
		
		this.ui.label = new UIText({
			title: this.label,
			block: true,
			callback: function(value) {
				self.label = value;
			}
		});
		
		this.ui.x = new UIText({
			label: "x",
			value: self.position.x,
			callback: function(value) {
				self.position.x = +value;
			}
		});

		this.ui.y = new UIText({
			label: "y",
			value: self.position.y,
			callback: function(value) {
				self.position.y = +value;
			}
		});

		this.ui.sceneSelectors = [];

		function addSceneSelector(scene, index) {
			self.ui.sceneSelectors[index] = new UISelect({
				options: Game.scenes,
				selected: scene,
				callback: function(value) {
					self.scenes[index] = value;
				}
			});
			return self.ui.sceneSelectors[index];
		}

		for (let i = 0; i < this.scenes.length; i++) {
			this.ui.sceneSelectors.push(addSceneSelector(this.scenes[i], i));
		}

		this.ui.addScene = new UIButton({
			title: "+ scene",
			callback: function() {
				const s = addSceneSelector(Game.scenes[0], self.scenes.length);
				edi.ui.panels.items.add(s, self.row);
			}
		});

		this.addUI();
	}

	removeUI() {
		edi.ui.panels.items.clearComponents(this.row);
		this.uiAdded = false;
	}

	get data() {
		return {
			src: this.src,
			x: this.position.x,
			y: this.position.y,
			states: this.animation.states,
			state: this.animation.state,
			scenes: this.scenes
		};
	}
}