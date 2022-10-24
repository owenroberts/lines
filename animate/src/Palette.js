/*
	collection of lines layeer settings
*/

function Palette(lns) {
	
	let panel;
	const palettes = {}; // palette.palettes ? what about list?
	let current;
	let keyIndex = 1;

	function add() {
		lns.draw.reset();
		const name = current = prompt('Name this palette.');
		if (name) {
			palettes[name] = {
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
			}; // get props ... 
			addUI(name);
		}
	}

	function addUI(name) {
		panel.addRow(name);
		
		const b = panel.add(new UIButton({
			text: name,
			callback: () => { load(name); }
		})); // why ??

		let thisKey = '+';
		if (keyIndex < 10) {
			lns.ui.keys[keyIndex] = b; // add all keys like this ???
			thisKey = keyIndex + '';
			keyIndex++;
		}

		const key = new UIText({
			text: thisKey,
			callback: value => {
				lns.ui.keys[+value].key.value = '';
				lns.ui.keys[+value].key.el.placeholder = '+';
				lns.ui.keys[+value] = b;
			}
		});
		b.key = key;
		panel.add(key);

		panel.add(new UIButton({
			text: '✎',
			callback: function() {
				const rename = prompt('Rename: ');
				palettes[rename] = _.cloneDeep(palettes[name]); // remove clone
				addUI(rename);
				remove(name);
			}
		}));

		panel.add(new UIButton({
			text: 'X',
			callback: () => { remove(name); }
		}));
	}

	function remove(name) {
		delete palettes[name];
		panel[name].clear();
	}

	function setup(data) {
		for (const key in data) {
			if (key === 'current') continue;
			addUI(key);
			palettes[key] = data[key];
		}
		if (data.current) load(data.current);
	}

	function load(name) {
		lns.draw.reset();
		palettes.current = name;
		const palette = palettes[name];
		for (prop in palette) {
			if (lns.ui.faces[prop] === undefined) continue;
			lns.ui.faces[prop].update(palette[prop]);
		}
	}

	function buildFromAnimation() {
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
			}; // get from layer
			
			let isACopy = false;
			for (const key in palettes) {
				const palette =  palettes[key];
				let samePalette = true;
				for (const prop in palette) {
					if (palette[prop] !== newPalette[prop]) samePalette = false;
				}
				if (samePalette) isACopy = true;
			}

			if (!isACopy) {
				palettes[name] = newPalette;
				addUI(name);
			}
		}
	}

	function quickSelect(ev) {

		const modal = new UIModal({
			title: "Select Pallette", 
			app: lns, 
			position: lns.mousePosition
		});

		for (const name in palettes) {
			if (name === 'current') continue;
			modal.add(new UIButton({
				text: name,
				callback: () => {
					load(name);
					modal.clear();
				}
			}));
		}
	}

	function saveFile() {
		const jsonfile = JSON.stringify(palettes);
		const fileName = prompt('Name:');
		const blob = new Blob([jsonfile], { type: "application/x-download;charset=utf-8" });
		saveAs(blob, `${fileName}.json`);
	}

	function connect(){
		panel = lns.ui.getPanel('palette');

		lns.ui.addCallbacks([
			{ callback: saveFile, text: 'Save File', },
			{ callback: buildFromAnimation, key: 'shift-p', text: 'Build', },
			{ callback: add, key: 'p', text: '+', },
			{ callback: quickSelect, key: 'q', text: 'Quick Select', },
		]);

		panel.add(new UIFile({
			text: 'Load File',
			callback: data => { setup(data) }
		}));
	}

	return { connect, getPalettes() { return palettes; } };
}