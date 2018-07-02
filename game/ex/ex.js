Game.init(960, 640, 10);
/* scenes 0: move character around */
Game.scenes = {
	'walk': {},
	'drag': {}
};
Game.currentScene = 'walk';

class Character extends Sprite {
	constructor(x, y) {
		super(x, y);
		this.speed = new Cool.Vector(0, 0); /* sprite physics has velocity ... */
		this.addAnimation('wiggle_char.json');
	}

	update() {
		this.position.x += this.speed.x;
		this.position.y += this.speed.y;
	} /* should be part of sprite already ? */
}

const char = new Character(300, 300);
Game.scenes.walk.characters = [];
Game.scenes.walk.characters.push(char);

function start() {
	console.log("game start");
}

function draw() {
	Game.scenes[Game.currentScene].characters.forEach(function(character) {
		character.display();
	});
}

function update() {
	Game.scenes[Game.currentScene].characters.forEach(function(character) {
		character.update();
	});
}

/* events */
function keyDown(key) {
	switch (key) {
		case 'a':
			char.speed.x = -5;
			break;
		case 'd':
			char.speed.x = 5;
			break;
		case 'w':
			char.speed.y = -5;
			break;
		case 's':
			char.speed.y = 5;
			break;
	}
}

function keyUp(key) {
	switch (key) {
		case 'a':
			char.speed.x = 0;
			break;
		case 'd':
			char.speed.x = 0;
			break;
		case 'w':
			char.speed.y = 0;
			break;
		case 's':
			char.speed.y = 0;
			break;
	}
}