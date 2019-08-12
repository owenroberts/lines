class Item extends Sprite {
	constructor(params, src, debug) {
		super(params.x, params.y);
		this.debug = debug;
		this.displayLabel = false;
		this.outline = false;
		this.label = params.label;
		this.src = src || params.src;
		if (this.src) {
			const self = this;
			self.addAnimation(self.src, function() {
				self.center();
			});
			self.animation.states = params.states || { idle: { start: 0, end: 0 } };
			self.animation.state = params.state || 'idle';
			self.animation.randomFrames = params.r || false;
		}

		this.scenes = params.scenes;
		this.type = params.file;

		this.ui = {};
		this.uiAdded = false;
	}

	display(view) {
		Game.ctx.strokeStyle = '#000000'; // game colors ???
		super.display(this.isInMapBounds(view));
		if (this.displayLabel) this.drawLabel();
		if (this.outline) this.drawOutline();
	}

	isInMapBounds(view) {
		if (this.position.x + this.width > view.x - view.width/2 - Game.width/2 &&
			this.position.x < view.x + view.width/2 + Game.width/2 &&
			this.position.y + this.height > view.y - view.height/2 - Game.height/2 &&
			this.position.y < view.y + view.height/2 + Game.height/2 ) {
			return true;
		} else {
			return false;
		}
	}

	drawLabel() {
		Game.ctx.fillText(this.label, this.position.x, this.position.y);
	}

	drawOutline() {
		Game.ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
	}

	mouseOver(_x, _y, zoom) {
		if (this.isInMapBounds(zoom.view)) {
			const {x, y} = zoom.translate(_x, _y);
			if (x > this.position.x &&
				x < this.position.x + this.width &&
				y > this.position.y &&
				y < this.position.y + this.height) {
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

	set selected(select) {
		console.log('select', select);
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
			this.row = edi.ui.panels.items.addRow();
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
				// label: 'scene:',
				options: Game.scenes,
				selected: scene,
				callback: function(value) {
					self.scenes[index] = value;
				}
			});
			return self.ui.sceneSelectors[index];
		}

		for (let i = 0; i < this.scenes.length; i++) {
			addSceneSelector(this.scenes[i], i);
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
}