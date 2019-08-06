function Palette(ui) {
	const self = this;
	this.palettes = {};
	this.current = '';

	this.addPalette = function() {
		lns.data.saveLines();
		const name = self.current = prompt('Name this palette.');
		if (name) {
			self.palettes[name] = {
				color: lns.lineColor.color,
				n: lns.draw.n,
				r: lns.draw.r,
				w: lns.draw.w,
				v: lns.draw.v,
				lineWidth: lns.canvas.ctx.lineWidth,
				mouse: lns.draw.mouseInterval,
				brush: lns.draw.brush,
				brushSpread: lns.draw.brushSpread,
				dots: lns.draw.dots,
				grass: lns.draw.grass
			};
			/* is this petter or panel better? */
			lns.interface.panels.palette.add(new UIButton({
				title: name,
				callback: function() {
					self.loadPalette(name);
				}
			}));
		}
	};

	this.loadPalette = function(name) {
		/* this is crazy ... */
		lns.data.saveLines();
		self.palettes.current = name;
		lns.lineColor.set(self.palettes[name].color);
		lns.draw.n = self.palettes[name].n;
		lns.draw.r = self.palettes[name].r;
		lns.draw.w = self.palettes[name].w;
		lns.draw.v = self.palettes[name].v;
		lns.canvas.ctx.lineWidth = self.palettes[name].lineWidth;
		lns.draw.mouseInterval = self.palettes[name].mouse;
		lns.draw.brush = self.palettes[name].brush;
		lns.draw.brushSpread = self.palettes[name].brushSpread;
		lns.draw.dots = self.palettes[name].dots;
		lns.draw.grass = self.palettes[name].grass;

		lns.interface.faces.w.setValue(self.palettes[name].n);
		lns.interface.faces.r.setValue(self.palettes[name].r);
		lns.interface.faces.w.setValue(self.palettes[name].w);
		lns.interface.faces.v.setValue(self.palettes[name].v);
		lns.interface.faces.lineWidth.setValue(self.palettes[name].lineWidth);
		lns.interface.faces.mouse.setValue(self.palettes[name].mouse);
		lns.interface.faces.brush.setValue(self.palettes[name].brush);
		lns.interface.faces.brushSpread.setValue(self.palettes[name].brushSpread);
		lns.interface.faces.dots.setValue(self.palettes[name].dots);
		lns.interface.faces.grass.setValue(self.palettes[name].grass);
	};
}