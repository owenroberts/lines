const gme = new Game({
	canvas: "map",
	width: 1024,
	height: 700,
	dps: 30,
	multiColor: true,
	checkRetina: true,
	scenes: ['game'],
	debug: true,
	stats: false,
	suspend: true,
	isEditor: true,
}); // maybe there's a way to use the garden js file here? modules & exports :O


const edi = {}; /* editor app */
edi.ui = new Interface(edi);
edi.ui.load('interface/interface.json', () => {
	gme.load({
		scenery: '/data/scenery.json',
		textures: '/data/textures.json'
	}, true);
});
edi.ui.settings = new Settings(edi, 'edi');
edi.ui.game = new GameSettings(edi, true); // scene, wiggle
edi.ui.textures = new Textures();
edi.ui.items = new Items();
edi.ui.markers = [];
edi.zoom = new Zoom();
edi.ruler = new Ruler();

edi.tool = {
	set: function(_toolName) {
		const toolName = _toolName.toolName || _toolName;
		edi.tool.current = toolName;
		// edi.ui.selectTool.value = toolName;
		gme.canvas.className = '';
		gme.canvas.classList.add(`${toolName}-tool`);
	},
	// need a selection class?
	items: new SpriteCollection(),
	clear: function() {
		edi.tool.items.all(item => {
			item.select(false); // deselect sprites
		});
		edi.tool.items.clear(); //  clear sprite collection
	},
	add: function(item) {
		edi.tool.items.add(item);
	}
}; /* tools: zoom/pan, transform, ruler - modulize if it gets complicated */
/* move this somewhere else eventually ... */

edi.search = {
	sprites: function(query) {
		edi.ui.panels.items.itemSearchResults.clear();
		gme.scenes.current.displaySprites.sprites.filter(s => {
			return query.length && s.label.includes(query);
		}).forEach(item => {
			let toggle = new UIToggle({
				text: item.label,
				callback: () => {
					item.select(toggle.isOn);
				}
			});
			edi.ui.panels.items.itemSearchResults.append(toggle);
		});
	}
};

edi.ui.reset = function() {
	for (const key in GAME.sprites) {
		GAME.sprites[key].removeUI();
	}
	for (const key in GAME.ui) {
		GAME.ui[key].removeUI();
	}
};

edi.data = new Data(gme, { save: false, path: '/drawings', files: ['scenery', 'textures'] });

edi.loadAnimation = function(type, label, src) {
	// if (gme.debug) console.log(`loading ${src}`);
	// if (gme.debug) console.time(`done ${src}`);
	fetch(src)
		.then(response => { return response.json(); })
		.then(json => {
			// if (gme.debug) console.timeEnd(`done ${src}`);
			gme.anims[type][label] = new EditorAnim();
			gme.anims[type][label].loadData(json, () => {
				gme.sprites[type][label].addAnimation(gme.anims[type][label]);
				gme.sprites[type][label].isLoaded = true;
			});
		});
};

function start() {

	let bounds = {
		left: -5000,
		top: -4000,
		right: 5000,
		bottom: 10000, // 5000
	}

	gme.sprites = {
		scenery: {},
		textures: {}
	}; // easier for editor 

	// maybe a way to make these regular ...
	for (const key in gme.data.scenery.entries) {
		const data = gme.data.scenery.entries[key];
		const s = new ItemEdit({ ...data, label: key });
		if (gme.anims.scenery[key]) {
			s.addAnimation(gme.anims.scenery[key]);
		}
		gme.scenes.add(s, data.scenes);
		gme.sprites.scenery[key] = s;
	}

	for (const key in gme.data.textures.entries) {
		const data = gme.data.textures.entries[key];
		const t = new TextureEdit({
			...data,
			frame: 'index',
			label: key,
		});
		if (gme.anims.textures[key]) {
			t.addAnimation(gme.anims.textures[key]);
		}
		gme.scenes.add(t, data.scenes);
		for (let i = 0; i < data.locations.length; i++) {
			gme.updateBounds(data.locations[i]);
		}
		gme.sprites.textures[key] = t;
	}

	edi.zoom.canvas.width = edi.zoom.view.width = GAME.width;
	edi.zoom.canvas.height = edi.zoom.view.height = GAME.height;
	edi.zoom.load();
	edi.tool.set('zoom');
	
	edi.ui.markers.push(new Marker(0, 0));
	for (let x = bounds.left; x < bounds.right; x += 500) {
		edi.ui.markers.push(new Marker(x, bounds.top, 200, 50, 5));
		// edi.ui.markers.push(new Marker(x, 0, 200, 50, 5));
		edi.ui.markers.push(new Marker(x, bounds.bottom, 200, 50, 5));
	}

	for (let y = bounds.top; y < bounds.bottom; y += 500) {
		edi.ui.markers.push(new Marker(bounds.right, y, 50, 200, 5));
		edi.ui.markers.push(new Marker(0, y, 50, 200, 5));
		edi.ui.markers.push(new Marker(bounds.left, y, 50, 200, 5));
	}

	let r = Math.abs(bounds.left) / Math.abs(bounds.top);
	let y = bounds.top + 500;
	for (let x = bounds.left + 500; x < 0; x += 500) {
		edi.ui.markers.push(new Marker(x, y, 100, 100, 5));
		y += 500 / r;
	}


	r = Math.abs(bounds.right) / Math.abs(bounds.top);
	y = bounds.top + 500;
	for (let x = bounds.right - 500; x > 0; x -= 500) {
		edi.ui.markers.push(new Marker(x, y, 100, 100, 5));
		y += 500 / r;
	}

	r = Math.abs(bounds.left) / Math.abs(bounds.bottom);
	y = bounds.bottom - 500;
	for (let x = bounds.left + 500; x < 0; x += 500) {
		edi.ui.markers.push(new Marker(x, y, 100, 100, 5));
		y -= 500 / r;
	}


	r = Math.abs(bounds.right) / Math.abs(bounds.bottom);
	y = bounds.bottom - 500;
	for (let x = bounds.right - 500; x > 0; x -= 500) {
		edi.ui.markers.push(new Marker(x, y, 100, 100, 5));
		y -= 500 / r;
	}


	gme.canvas.addEventListener("mousewheel", function(ev) {
		edi.zoom.wheel(ev, function() {
			gme.ctx.miterLimit = 1;
		});
	}, false);

	edi.ui.faces.scenes.setOptions(gme.scenes);

	fetch('/data/settings.json')
		.then(response => { return response.json(); })
		.then(json => {
			for (const type in json) {
				for (const label in json[type]) {
					const sprite = gme.sprites[type][label];
					const data = json[type][label];
					try {
						sprite.select(false); // unselect stop gap
						if (data.isLoaded && !gme.anims[type][label]) {
							edi.loadAnimation(type, label, sprite.src);
						}
						sprite.isSelectable = data.isSelectable;
						sprite.isLocked = data.isLocked;
					} catch(error) {
						console.warn(error.message);
					}

				}
			}
		});
	edi.ui.settings.load();
	/* settings loaded before map done loading */

	gme.scene = 'game';
}

function draw() {

	edi.zoom.clear(gme.ctx);
	edi.zoom.set(gme.ctx, { x: gme.width / 2, y: gme.height / 2 });

	/* not sure where to put this .... */
	gme.ctx.font = '16px monaco';
	gme.ctx.fillStyle = '#bb11ff';

	for (let i = 0; i < edi.ui.markers.length; i++) {
		edi.ui.markers[i].display(edi.zoom.view);
	}

	/* draw sprites -- data, scenes? */
	gme.scenes.current.display(edi.zoom.view);

	if (edi.tool.current == 'ruler') edi.ruler.display();

	edi.zoom.clear(gme.ctx);
}

/* what module would this be in? */
function mouseMoved(x, y, button) {
	if (button == 1) {
		/* does button exist if no mouse down? */
		if (edi.zoom.mouseDown) {
			const delta = edi.zoom.getDelta(x, y);
			if (edi.tool.current == 'transform' && 
				edi.tool.items.length > 0) {
				edi.tool.items.all(item => {
					item.update([
						Math.round(delta.x),
						Math.round(delta.y) 
					]);
				});
			} else {
				edi.zoom.updateView(delta.x, delta.y);
			}
		}
	}

	edi.zoom.updatePrevious(x, y);
	if (!edi.tool.item) intersectItems(x, y, false);
}

function mouseDown(x, y, button, shift) {
	if (button == 1) {
		if (edi.tool.current == 'location') {
			const xy = edi.zoom.translate(x, y);
			edi.tool.callback(xy.x, xy.y);
		} else {
			const item = intersectItems(x, y);
			// console.log(item.label);

			if (edi.tool.items.length > 0) {
				if (item && shift) { // select multiple items
					item.select(true, shift);
				} else if (item && !shift) {
					if (!edi.tool.items.includes(item)) {
						edi.tool.clear();
						item.select(true, shift);
					} else if (item.constructor.name == 'TextureEdit') {
						item.select(true, shift);
					}
				} else if (!item) {
					edi.tool.clear();
				}
			} else if (item) {
				item.select(true);
			}

			if (item.isSelected) edi.tool.items.add(item);
			else edi.tool.items.remove(item);
			
			edi.zoom.mouseDown = true;
	
			/* can this happen in zoom module probably */
			if (!edi.zoom.previous.x) edi.zoom.previous.x = x;
			if (!edi.zoom.previous.y) edi.zoom.previous.y = y;
		}
	}
}

function mouseUp(x, y, button) {
	if (button == 1) edi.zoom.mouseDown = false;
} 

/* what module should this be in??? */
function intersectItems(x, y, move) {

	// callback return doesn't work ... 
	let returnSprite = false;
	for (let i = 0; i < gme.scenes.current.displaySprites.length; i++) {
		const s = gme.scenes.current.displaySprites.sprite(i);
		if (s.isMouseOver(x, y, edi.zoom) && !returnSprite) returnSprite = s;
	}

	return returnSprite;
}