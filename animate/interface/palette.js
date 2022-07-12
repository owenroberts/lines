function Palette() {
	const self = this;
	this.palettes = {};
	let keyIndex = 1;

	this.add = function() {
		lns.draw.reset();
		const name = self.current = prompt('Name this palette.');
		if (name) {
			self.palettes[name] = {
				color: lns.draw.layer.color,
				segmentNum: lns.draw.layer.segmentNum,
				jiggleRange: lns.draw.layer.jiggleRange,
				wiggleRange: lns.draw.layer.wiggleRange,
				wiggleSpeed: lns.draw.layer.wiggleSpeed,
				wiggleSegments: lns.draw.layer.wiggleSegments,
				breaks: lns.draw.layer.breaks,
				linesInterval: lns.draw.layer.linesInterval,
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
		self.panel.addRow(name);
		
		const b = new UIButton({
			text: name,
			callback: function() {
				self.load(name);
			}
		})
		self.panel.add(b);

		let thisKey = '+';
		if (keyIndex < 10) {
			lns.ui.keys[keyIndex] = b;
			thisKey = keyIndex + '';
			keyIndex++;
		}

		const key = new UIText({
			text: thisKey,
			callback: function(value) {
				lns.ui.keys[+value].key.value = '';
				lns.ui.keys[+value].key.el.placeholder = '+';
				lns.ui.keys[+value] = b;
			}
		});
		b.key = key;
		self.panel.add(key);

		self.panel.add(new UIButton({
			text: '✎',
			callback: function() {
				const rename = prompt('Rename: ');
				self.palettes[rename] = _.cloneDeep(self.palettes[name]);
				self.addUI(rename);
				self.remove(name);
			}
		}));

		self.panel.add(new UIButton({
			text: 'X',
			callback: function() {
				self.remove(name);
			}
		}));
	};

	this.remove = function(name) {
		delete self.palettes[name];
		self.panel[name].clear();
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
			} 
			// else {
			// 	console.log('no face', prop)
			// }
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
				linesInterval: lns.draw.layer.linesInterval,
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
					if (palette[prop] !== newPalette[prop]) samePalette = false;
				}
				if (samePalette) isACopy = true;
			}

			if (!isACopy) {
				self.palettes[name] = newPalette;
				self.addUI(name);
			}
		}
	};

	this.quickSelect = function(ev) {
		const modal = new UIModal({
			title: "Select Pallette", 
			app: lns, 
			position: lns.mousePosition
		});

		for (const key in self.palettes) {
			if (key !== 'current') {
				modal.add(new UIButton({
					text: key,
					callback: function() {
						self.load(key);
						modal.clear();
					}
				}))
			}
		}
	};

	this.saveFile = function() {
		const jsonfile = JSON.stringify(self.palettes);
		const fileName = prompt('Name:');
		const blob = new Blob([jsonfile], { type: "application/x-download;charset=utf-8" });
		saveAs(blob, `${fileName}.json`);
	};

	this.loadFile = function() {
		const openFile = document.createElement('input');
		openFile.type = "file";
		openFile.click();
		openFile.onchange = function() {
			for (let i = 0, f; f = openFile.files[i]; i++) {
				if (!f.type.match('application/json')) continue;
				const reader = new FileReader();
				reader.onload = (function(theFile) {
					return function(e) {
						console.log(e.target.result);
						self.setup(JSON.parse(e.target.result));
					}
				})(f);
				reader.readAsText(f);
			}
		};
	};
}