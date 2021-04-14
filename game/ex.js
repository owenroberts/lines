/*
	just an example to set up a game file
	not necessarily best approach
*/
const gme = new Game({
	width: window.innerWidth, 
	height: window.innerHeight, 
	dps: 30,
	stats: true,
	debug: false,
	multiColor: true,
	checkRetina: true,
	scenes: ['walk', 'drag']
});
gme.load({ data: "ex/data.json" });
gme.scene = 'walk';

let char;
let waves;

function start() {

	char = new Character(300, 300);
	gme.scenes.walk.add(char);

	waves = new Texture({
		frame: 'random',
		center: true,
		animation: gme.anims.data.waves
	});
	waves.addLocation(100, 400);
	waves.addLocation(300, 400);
	waves.addLocation(500, 400);

	// waves = new Sprite(400, 400);
	// waves.addAnimation(gme.anims.data.waves);
	// waves.animation.randomFrames = true;
	gme.scenes.walk.addToDisplay(waves);


	const title = new Text(10, 40, "welcome to the game", 10, gme.anims.data.letters);
	gme.scenes.walk.addToDisplay(title);

	const joinGame = new Button({ 
		x: 400, y: 100, 
		animation: gme.anims.data['join_game'], 
		states: {
			"idle": { "start": 0, "end": 0 },
			"over": { "start": 1, "end": 1 },
			"selected": { "start": 2, "end": 2 },
			"active": { "start": 3, "end": 3 }
		},
		onClick: function() {
			console.log('join game');
		}
	});
	gme.scenes.walk.addUI(joinGame);
}

function draw() {
	gme.scenes[gme.scene].display();
}

function update() {
	gme.scenes[gme.scene].update();
}

/* events */
function keyDown(key) {
	switch (key) {
		case 'a':
		case 'left':
			char.speed.x = -5;
			break;
		case 'd':
		case 'right':
			char.speed.x = 5;
			break;
		case 'w':
		case 'up':
			char.speed.y = -5;
			break;
		case 's':
		case 'down':
			char.speed.y = 5;
			break;
	}
}

function keyUp(key) {
	switch (key) {
		case 'a':
		case 'left':
			char.speed.x = 0;
			break;
		case 'd':
		case 'right':
			char.speed.x = 0;
			break;
		case 'w':
		case 'up':
			char.speed.y = 0;
			break;
		case 's':
		case 'down':
			char.speed.y = 0;
			break;
	}
}

function mouseMoved(x, y) {
	gme.scenes[gme.scene].mouseMoved(x, y);
}

function mouseDown(x, y) {
	gme.scenes[gme.scene].mouseDown(x, y);
}

function mouseUp(x, y) {
	gme.scenes[gme.scene].mouseUp(x, y);
}