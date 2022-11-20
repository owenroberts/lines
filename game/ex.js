/*
	just an example to set up a game file
	not necessarily best approach
*/

const { Game, Texture, Button, TextSprite } = window.LinesEngine;

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

gme.start = function() {

	char = new Character(300, 300);
	gme.scenes.walk.addSprite(char);

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

	const title = new TextSprite(10, 40, "welcome to the game", 10, gme.anims.data.letters, 'abcdefghijklmnopqrstuvwxyz0123456789.,:?EFASDW....MJKLQ');
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

};

gme.update = function() {
	gme.scenes[gme.scene].update();
};

gme.draw = function() {
	gme.scenes[gme.scene].display();
};

/* events */
gme.keyDown = function(key) {
	switch (key) {
		case 'a':
		case 'left':
			char.speed[0] = -5;
			break;
		case 'd':
		case 'right':
			char.speed[0] = 5;
			break;
		case 'w':
		case 'up':
			char.speed[1] = -5;
			break;
		case 's':
		case 'down':
			char.speed[1] = 5;
			break;
	}
};

gme.keyUp = function(key) {
	switch (key) {
		case 'a':
		case 'left':
			char.speed[0] = 0;
			break;
		case 'd':
		case 'right':
			char.speed[0] = 0;
			break;
		case 'w':
		case 'up':
			char.speed[1] = 0;
			break;
		case 's':
		case 'down':
			char.speed[1] = 0;
			break;
	}
};

gme.mouseMoved = function(x, y) {
	gme.scenes[gme.scene].mouseMoved(x, y);
};

gme.mouseDown = function(x, y) {
	gme.scenes[gme.scene].mouseDown(x, y);
};

gme.mouseUp = function(x, y) {
	gme.scenes[gme.scene].mouseUp(x, y);
};