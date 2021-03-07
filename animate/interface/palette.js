function Palette() {
	const self = this;
	this.palettes = {};

	this.add = function() {
		lns.draw.reset();
		const name = self.current = prompt('Name this palette.');
		if (name) {
			self.palettes[name] = {
				color: lns.draw.layer.color,
				segmentNum: lns.draw.layer.segmentNum,
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
		lns.draw.reset();
		self.palettes.current = name;

		const palette = self.palettes[name];
		for (prop in palette) {
			if (lns.ui.faces[prop] !== undefined) {
				lns.ui.faces[prop].update(palette[prop]);
			} else {
				console.log(' no face', prop)
			}
		};
	};

	this.buildFromAnimation = function() {
		for (let i = 0; i < lns.anim.layers.length; i++) {
			const name = `Layer ${i}`;
			const layer = lns.anim.layers[i];
			// replace with paletteProps
			const newPalette = {
				color: layer.color,
				segmentNum: layer.segmentNum,
				jiggleRange: layer.jiggleRange,
				wiggleRange: layer.wiggleRange,
				wiggleSpeed: layer.wiggleSpeed,
				wiggleSegments: layer.wiggleSegments,
				breaks: layer.breaks,
				lineWidth: lns.canvas.ctx.lineWidth,
				mouseInterval: lns.draw.mouseInterval,
				brush: 0,
				brushSpread: lns.draw.brushSpread,
				dots: lns.draw.dots,
				grass: lns.draw.grass
			};
			
			let isACopy = false;
			for (const key in self.palettes) {
				const palette = self.palettes[key];
				let samePalette = true;
				for (const prop in palette) {
					if (palette[prop] != newPalette[prop]) samePalette = false;
				}
				if (samePalette) isACopy = true;
			}

			if (!isACopy) {
				self.palettes[name] = newPalette;
				self.addUI(name);
			}
		}
	};
}