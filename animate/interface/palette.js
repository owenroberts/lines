function Palette() {
	const self = this;
	this.palettes = {};

	this.add = function() {
		lns.data.saveLines();
		const name = self.current = prompt('Name this palette.');
		if (name) {
			self.palettes[name] = {
				c: lns.draw.layer.c,
				n: lns.draw.layer.n,
				r: lns.draw.layer.r,
				w: lns.draw.layer.w,
				v: lns.draw.layer.v,
				lineWidth: lns.canvas.ctx.lineWidth,
				mouseInterval: lns.draw.mouseInterval,
				brush: lns.draw.brush,
				brushSpread: lns.draw.brushSpread,
				dots: lns.draw.dots,
				grass: lns.draw.grass
			};
			self.addUI(name);
		}
	};

	this.addUI = function(name) {
		self.panel.add(new UIButton({
			text: name,
			callback: function() {
				self.load(name);
			}
		}));
	};

	this.setup = function(palettes) {
		for (const key in palettes) {
			if (key != 'current') {
				self.addUI(key);
				self.palettes[key] = palettes[key];
			}
		}
		if (palettes.current) self.load(palettes.current);
	};

	this.load = function(name) {
		/* this is crazy ... */
		lns.data.saveLines();
		self.palettes.current = name;

		const palette = self.palettes[name];
		
		lns.draw.setProperties(self.palettes[name]);

		lns.canvas.ctx.lineWidth = self.palettes[name].lineWidth;
		
		lns.draw.brush = self.palettes[name].brush;
		lns.draw.brushSpread = self.palettes[name].brushSpread;
		lns.draw.dots = self.palettes[name].dots;
		lns.draw.grass = self.palettes[name].grass;

		for (prop in palette) {
			if (lns.ui.faces[prop] !== undefined) {
				lns.ui.faces[prop].value = palette[prop];
			}
		};
	};

	this.buildFromAnimation = function() {
		for (let i = 0; i < lns.anim.layers.length; i++) {
			const name = `Layer ${i}`;
			const layer = lns.anim.layers[i];
			self.palettes[name] = {
				c: layer.c,
				n: layer.n,
				r: layer.r,
				w: layer.w,
				v: layer.v,
				lineWidth: lns.canvas.ctx.lineWidth,
				mouseInterval: lns.draw.mouseInterval,
				brush: 0,
				brushSpread: lns.draw.brushSpread,
				dots: lns.draw.dots,
				grass: lns.draw.grass
			};
			self.addUI(name);
		}
	};
}