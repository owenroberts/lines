/* use Map object ?? - maybe if using iframes but not for this */

const zoom = new Zoom();
const data = new Data({ save: false });
const ruler = new Ruler();
const tool = {
	current: 'zoom',
	item: undefined,
	set: function(toolName) {
		Game.canvas.classList.add(`${toolName}-tool`);
	}
}; /* tools: zoom/pan, transform, ruler - modulize if it gets complicated */
const ui = {};

Game.init({
	canvas: "map",
	width: 800,
	height: 600,
	lps: 12,
});

/* organize by scene ??? handle loading by scene? */
// const files = { ui: "ui.json", map: "map.json" };
// Game.load(files, data.load, function() { Game.start(); });
Game.start();

function start() {
	zoom.canvas.width = zoom.view.width = Game.width;
	zoom.canvas.height = zoom.view.height = Game.height;
	tool.set('zoom');
	ui.center = new Marker(0, 0);

	Game.canvas.addEventListener("mousewheel", function(ev) {
		zoom.wheel(ev, function() {
			Game.ctx.miterLimit = 1;
		});
	}, false);

	//  document.oncontextmenu = function() { return false; } 
	/* maybe dont need with tool selector */
}

function draw() {
	zoom.set(Game.ctx, { x: Game.width/2, y: Game.height/2 });

	for (const key in ui) {
		ui[key].display();
	}

	/* not sure where to put this .... */
	Game.ctx.font = '16px monaco';
	Game.ctx.fillStyle = '#bb11ff';

	/* draw sprites -- data, scenes? */

	if (tool.current == 'ruler') ruler.display();
}

/* what module would this be in? */
function mouseMoved(x, y, button) {
	if (button == 1) {
		/* does button exist if no mouse down? */
		if (zoom.mouseDown) {
			const delta = zoom.getDelta(x, y);
			if (tool.current == 'transform' && tool.item) 
				tool.item.updatePosition(delta.x, delta.y);
			else 
				zoom.updateView(delta.x, delta.y);
		}
	}

	zoom.updatePrevious(x, y);
	if (!tool.item) intersectItems(x, y, false);
}

function mouseDown(x, y, button) {
	if (button == 1) {
		if (tool.current == 'transform') tool.item = intersectItems(x, y, true);
		zoom.mouseDown = true;

		/* can this happen in zoom module probably */
		if (!zoom.previous.x) zoom.previous.x = x;
		if (!zoom.previous.y) zoom.previous.y = y;
	}
}

/* does button matter ?? */
function mouseUp(x, y, button) {
	if (button == 1) {
		if (tool.current == 'transform' && tool.item) {
			tool.item.move = false;
			tool.item = undefined; /* method ? */
		}
		zoom.mouseDown = false;
	}
} 

/* what module should this be in??? */
function intersectItems(x, y, move) {
	// for (const interactive in map.interactives) {
	// 	const intersect = map.interactives[interactive].mouseOver(x, y, move);
	// 	if (intersect) return intersect;
	// }

	// for (const s in map.scenery) {
	// 	const set = map.scenery[s];
	// 	for (let i = 0; i < set.length; i++) {
	// 		const intersect = map.scenery[s][i].mouseOver(x, y, move);
	// 		if (intersect) return intersect;
	// 	}
	// }
}