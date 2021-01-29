const gme = new Game({
	canvas: "map",
	width: 960,
	height: 720,
	dps: 30,
	mixedColors: true,
	checkRetina: true,
	scenes: ['game'],
	debug: true,
	stats: false,
	suspend: true
}); // maybe there's a way to use the garden js file here? modules & exports :O

gme.load({
	scenery: '/data/scenery.json',
	textures: '/data/textures.json'
});

const edi = {}; /* editor app */
edi.ui = new Interface(edi);
edi.ui.load('interface/interface.json');
edi.ui.settings = new Settings(edi, 'edi');
edi.ui.game = new GameSettings(edi); // scene, wiggle
edi.ui.textures = new Textures();
edi.ui.items = new Items();
edi.ui.markers = {};
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
	items: new SpriteCollection(),
	clear: function() {
		edi.tool.items.all(item => {
			item.select(false); // deselect sprites
		});
		edi.tool.items.clear(); //  clear sprite collection
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

function start() {

	gme.sprites = {
		scenery: {},
		textures: {}
	}; // easier for editor 

	// maybe a way to make these regular ...
	for (const key in gme.data.scenery.entries) {
		const data = gme.data.scenery.entries[key];
		const s = new ItemEdit({ ...data, label: key });
		s.addAnimation(gme.anims.scenery[key]);
		gme.scenes.add(s, data.scenes);
		gme.updateBounds(s.position);
		gme.sprites.scenery[key] = s;
	}

	for (const key in gme.data.textures.entries) {
		const data = gme.data.textures.entries[key];
		const t = new TextureEdit({
			...data,
			animation: gme.anims.textures[key],
			frame: 'index',
			label: key,
		});
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
	edi.ui.markers.center = new Marker(0, 0);
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
				for (const sprite in json[type]) {
					for (const prop in json[type][sprite]) {
						gme.sprites[type][sprite][prop] = json[type][sprite][prop];
						gme.sprites[type][sprite].select(false);
						// unselect stop gap
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
	// edi.zoom.set(gme.ctx, { x: gme.width/2, y: gme.height/2 });
	edi.zoom.set(gme.ctx, { x: gme.width/2, y: gme.height/2 });

	// const view = edi.zoom.view;
	// GAME.ctx.fillRect(view.x - GAME.width/2, view.y - GAME.height/2,view.width + GAME.width, view.height + GAME.height);

	/* not sure where to put this .... */
	gme.ctx.font = '16px monaco';
	gme.ctx.fillStyle = '#bb11ff';

	for (const key in edi.ui.markers) {
		edi.ui.markers[key].display();
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
					item.update({ 
						x: Math.round(delta.x),
						y: Math.round(delta.y) 
					});
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

			if (edi.tool.items.length > 0) {
				if (item && shift) { // select multiple items
					item.select(true);
				} else if (item && !shift && !edi.tool.items.includes(item)) {
					edi.tool.clear();
					item.select(true);
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
	for (let i = 0; i < gme.scenes.current.displaySprites.length; i++) {
		const s = gme.scenes.current.displaySprites.sprite(i);
		if (s.isMouseOver(x, y, edi.zoom)) return s;
	}

	return false;
}