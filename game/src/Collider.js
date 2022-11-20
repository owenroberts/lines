/*
	simple collider for basic click events and AABB collisions
	this actually doesn't work because it needs to have access to sprite position
	sprite could inherit from Rect or Collider class ... 

	issue is really having mulitple classes for Entity, Sprite, ColliderSprite, ColliderEntity
*/

class Collider {
	constructor(x, y, w, h) {
		this.position = [x, y];
		this.size = [w, h];

		this.mouseOver = false;
		this.waitToGoOut = false;
		this.clickStarted = false;
		// onOver, onOut, onUp, onDown, onClick
	}

	set(x, y, w, h) {
		this.position = [x, y];
		this.size = [x, y];
	}


}