Game.init(960, 640, 10);
/* scenes 0: move character around */
Game.scenes = {
	'walk': {},
	'drag': {}
};
Game.currentScene = 'walk';

function Character(x, y) {
	this.speed = new Cool.Vector(0, 0);
	this.sprite = new Sprite(x, y, 50, 200);
	// this.sprite.debug = true;
	this.sprite.addAnimation('char.json');
	this.display = function() {
		this.sprite.display();
	};
	this.update = function() {
		this.sprite.position.x += this.speed.x;
		this.sprite.position.y += this.speed.y;
	}
}

const char = new Character(300, 300);
Game.scenes.walk.characters = [];
Game.scenes.walk.characters.push(char);


function start() {
	console.log("start");
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
document.addEventListener("keydown", function(event) {
	const key = Cool.keys[event.which];
	console.log(key);
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
});

document.addEventListener("keyup", function(event) {
	const key = Cool.keys[event.which];
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
});