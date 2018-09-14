class Sprite {
	constructor(x, y, w, h) {
		this.position = new Cool.Vector(x, y);
		this.width = w;
		this.height = h;
		this.ctx = Game.ctx; /* should ctx be an argument? */
		this.debug = false; /* argument? */
		this.debugColor = "#00ffbb";
		this.drawBackground = false;
		this.initPhysics();
		// this.bkg = false; /* draw a filled in outline */
	}

	/* make a physics class? */
	initPhysics() {
		this.collider = {
			position: new Cool.Vector(0, 0),
			width: this.width,
			height: this.height
		};
		this.jumpAmount = 0;
		this.velocity = new Cool.Vector(0,0);
		this.alive = true;
		this.bounceAmount = new Cool.Vector(0,0);
		this.bounce = false;
		this.wiggleAmount = -1;
	}
	
	addAnimation(src, callback) {
		this.animation = new Animation(src, this.debug);
		if (!this.width) {
			/* load size from animation data */
			this.animation.load(false, (w, h) => {
				this.width = this.collider.width = w;
				this.height = this.collider.height = h;
				if (callback)
					callback();
			});
		} else {
			/* size determined by sprite */
			this.animation.load({w: this.width, h: this.height});
		}
		if (this.debug) 
			this.animation.debug = true;
		if (this.drawBackground)
			this.animation.drawBackground = true;
	}

	setCollider(x, y, w, h) {
		this.collider.position.x = x;
		this.collider.position.y = y;
		this.collider.width = w;
		this.collider.height = h;
	}

	scale(n) {
		/* need to wait for animation to load, do this later */
		this.animation.widthRatio = this.width / (this.width*n);
		this.animation.heightRatio = this.height / (this.height*n);
		this.width *= n;
		this.height *= n;
		this.collider.width *= n;
		this.collider.height *= n;
	}

	update() {
		if (this.alive) {
			if (this.jumpAmount != 0) {
				this.velocity.y += this.jumpAmount;
				this.jumpAmount = 0;
			}
			if (this.wiggleAmount > 0) {
				this.velocity.x += getRandom(-this.wiggleAmount, this.wiggleAmount);
			}
			this.position.add( this.velocity );
			if (!this.bounceAmount.zero()) {
				this.velocity.add( this.bouncAmount );
				this.bounceAmount = new Cool.Vector(0,0);
			}
		}
	}

	display() {
		if (this.alive && this.isOnScreen()) {
			if (this.debug) {
				this.ctx.beginPath();
				this.ctx.lineWidth = 1;
				this.ctx.rect(
					this.position.x + this.collider.position.x, 
					this.position.y + this.collider.position.y, 
					this.collider.width, 
					this.collider.height
				);
				if (this.ctx.strokeStyle != this.debugColor) 
					this.ctx.strokeStyle = this.debugColor;
				this.ctx.stroke();
			}
			if (this.animation && this.animation.loaded) {
				if (this.bkg) 
					this.animation.drawBkg(this.position.x, this.position.y);
				else 
					this.animation.draw(this.position.x, this.position.y);
			}
		}
	}

	isOnScreen() {
		if (this.position.x + this.width > 0 && 
			this.position.y + this.height > 0 &&
			this.position.x < Game.width &&
			this.position.y < Game.height)
			return true;
		else
			return false;
	} /* from idtio item class */

	center() {
		this.position.x -= this.width / 2;
		this.position.y -= this.height / 2;
	}

	/* better name for this? collide */
	tap(x, y) {
		if (x > this.position.x + this.collider.position.x &&
			x < this.position.x + this.collider.position.x + this.collider.width && 
			y > this.position.y + this.collider.position.y && 
			y < this.position.y + this.collider.position.y + this.collider.height) {
			return true;
		} else 
			return false;
	}

	/* physics stuff .... */
	jump(amount) {
		this.jumpAmount += Math.min(-amount / 25, 10);
	}

	/* nm this is collide*/
	collide(other, callback) {
		if (this.alive && other.alive) {
			if (this.position.x + this.collider.position.x < other.position.x + other.collider.position.x + other.collider.width &&
				this.position.x + this.collider.position.x + this.collider.width > other.position.x + other.collider.position.x && 
				this.position.y + this.collider.position.y < other.position.y + other.collider.position.y + other.collider.height && 
				this.position.y + this.collider.position.y + this.collider.size.y > other.position.y + other.collider.height) {
				if (callback) 
					callback(this);
				return true;
			} else if (this.bounce) {
				// check next frame
				var nextpos = new Cool.Vector(this.position.x, this.position.y);
				nextpos.add(this.velocity);
				if (nextpos.x < other.position.x + other.width &&
				nextpos.x + this.width > other.position.x  && 
				nextpos.y < other.position.y + other.size.y && 
				nextpos.y + this.height > other.position.y) {
					var xoff = (this.position.x + this.width) - other.position.y;
					var yoff = (this.position.y + this.height) - other.position.y;
					if ( Math.abs(xoff) < Math.abs(yoff) ) {
						this.position.x = other.position.x - this.width;
					} else {
						this.position.y = other.position.y - this.height;
						this.bounceAmount.add( new Cool.Vector(0, yoff/2) );
					}
					if (callback) callback(this);				
					return true;
				}
				return false;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	/* not totally sure what this is used for ... */
	outside(other) {
		var next = this.position.copy();
		var nextCollider = this.collider.position.copy();
		next.add(nextCollider);
		next.add(this.velocity);
		var nextSize = this.collider.size.copy();
		if (next.x < other.position.x + other.collider.position.x ||
			next.x + nextSize.x > other.position.x + other.collider.position.x + other.collider.width ||
			next.y < other.position.y + other.collider.position.y ||
			next.y + nextSize.y > other.position.y + other.collider.position.y + other.collider.height) {
			return true;
		} else {
			return false;
		}
	}

	dies() {
		this.alive = false;
		this.animation.play = false;
		var p = this;
		setTimeout( function() {
			//p.alive = true;
			//p.pos = new Cool.Vector(10, 20);
		}, 1000);
	}

	reset(widthMin, widthMax, heightMin, heightMax) {
		this.position.x = Cool.randomInt(widthMin, widthMax - this.width);
		this.position.y = Cool.randomInt(heightMin, heightMax);
	}
}
