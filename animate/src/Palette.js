/*
	collection of lines layeer settings
*/

function Palette(lns) {
	
	const palettes = {};
	let current; // face
	let panel, currentSelect;
	let keyIndex = 1;
	let resetOnChange = true; // will save lines before changing

	// list of props/faces to save
	const paletteProps = [
		
		// layer
		'linesInterval',
		'segmentNum',
		'jiggleRange',
		'wiggleRange',
		'wiggleSpeed',
		'wiggleSegments',
		'breaks',
		'color',

		// brush
		'brushIsActive',
		'brushSpreadXLeft',
		'brushSpreadXRight',
		'brushSpreadYDown',
		'brushSpreadYUp',
		'brushSpreadMultiplier',
		'brushRandomX',
		'brushRandomY',
		'brushSegmentsMin',
		'brushSegmentsMax',

		// mouse
		'mouseInterval',
		'distanceThreshold',

		// env
		'lineWidth',
	];

	function add() {
		lns.draw.reset();
		const name = prompt('Name this palette.');
		if (!name) return;
		current = name;
		if (name) {
			palettes[name] = createPallete();
			console.log('palettes', palettes);
			addUI(name);
		}
	}

	function createPallete(data) {
		const palette = { ...data }; // data to create pallettes from existing layers
		paletteProps.forEach(prop => {
			if (!palette[prop]) palette[prop] = lns.ui.faces[prop].value;
		});
		return palette;
	}

	function addUI(name) {
		panel.addRow(name);
		
		const b = panel.add(new UIButton({
			text: name,
			class: 'left-end',
			callback: () => { load(name); }
		}));

		panel.add(new UIButton({
			text: '✎',
			class: 'right-end',
			callback: () => {
				let rename = prompt('Rename: ');
				if (!rename) return;
				palettes[rename] = _.cloneDeep(palettes[name]); // remove clone
				addUI(rename);
				remove(name);
			}
		}));

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
			addUI(key);
			palettes[key] = data[key];
			currentSelect.addOption(key);
		}
	}

	function load(name) {
		if (resetOnChange) lns.draw.reset();
		const palette = palettes[name];
		for (const prop in palette) {
			if (lns.ui.faces[prop] === undefined) continue;
			lns.ui.faces[prop].update(palette[prop]);
		}
	}

	function buildFromAnimation() {
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			const name = `Layer ${i}`;
			const layer = lns.anim.layers[i];
			const newPalette = createPallete(layer.getEditProps());
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

		currentSelect = lns.ui.addProp('currentPalette', {
			type: 'UISelect',
			value: 'None',
			options: ['None'],
			callback: value => { current = value; },
		});
		
		lns.ui.addProps({
			'paletteResetOnChange': {
				type: 'UIToggleCheck',
				value: resetOnChange,
				label: 'Reset',
				callback: value => { resetOnChange = value; },
			}
		});

		lns.ui.addCallbacks([
			{ callback: saveFile, text: 'Save File', row: true, },
			{ callback: buildFromAnimation, key: 'shift-p', text: 'Build', },
			{ callback: quickSelect, key: 'q', text: 'Quick Select', },
		]);

		panel.add(new UIFile({
			text: 'Load File',
			promptDefault: 'palettes',
			callback: data => { setup(data) }
		}));

		lns.ui.addCallbacks([
			{ callback: add, key: 'p', text: '+', row: true, },
		]);
	}

	return { connect, setup, getPalettes() { return palettes; } };
}