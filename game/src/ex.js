/*
	just an example to set up a game file
	not necessarily best approach
*/

import { Game, Texture, Button, TextSprite } from '../../src/GameEngine.js';
import { Character } from './Character.js';

const gme = new Game({
	width: 700,
	height: 600,
	dps: 30,
	stats: true,
	debug: false,
	multiColor: true,
	checkRetina: true,
	scenes: ['walk', 'drag']
});
gme.load({ animations: { sprites: "./data.json" } });
gme.scene = 'walk';

console.log('gme', gme);

let char;
let waves;

gme.start = function() {

	char = new Character(300, 300, gme.anims.sprites.sprite);
	gme.scenes.walk.addSprite(char);

	waves = new Texture({
		frame: 'random',
		center: true,
		animation: gme.anims.sprites.waves
	});
	waves.addLocation(100, 400);
	waves.addLocation(300, 400);
	waves.addLocation(500, 400);

	// waves = new Sprite(400, 400);
	// waves.addAnimation(gme.anims.sprites.waves);
	// waves.animation.randomFrames = true;
	gme.scenes.walk.addToDisplay(waves);

	const title = new TextSprite({ x: 10, y: 40, msg: "welcome to the game", lead: 10, letters: gme.anims.sprites.letters, letterIndexString: 'abcdefghijklmnopqrstuvwxyz0123456789.,:?EFASDW....MJKLQ' });
	gme.scenes.walk.addToDisplay(title);

	const joinGame = new Button({ 
		x: 400, y: 100, 
		animation: gme.anims.sprites['join_game'], 
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