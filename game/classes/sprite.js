class Sprite {
	constructor(x, y, w, h) {
		this.position = new Cool.Vector(x, y);
		this.width = w;
		this.height = h;
		this.debug = false; /* argument? */
		this.debugColor = "#00ffbb";
		this.collider = {
			position: new Cool.Vector(0, 0),
			width: this.width,
			height: this.height
		};
		this.alive = true;  // need a better name for this - disabled or something ... 

		this.mouseOver = false;
		this.waitToGoOut = false;
		this.clickStarted = false;
		// onOver, onOut, onUp, onDown, onClick
	}
	
	/* i don't know why the other reset exists,
		need this to add new animtion in toilet2 */
	resetSize() {
		this.width = undefined;
		this.height = undefined;
	}

	/* rewrite later ... */	
	addJSON(json, callback) {
		this.animation = new Anim();
		this.animation.loadJSON(json, data => {
			this.width = this.collider.width = data.w;
			this.height = this.collider.height = data.h;
			if (callback) callback();
		});
	}

	addAnimation(src, callback) {
		this.animation = new Anim();
		this.animation.load(src, data => {
			this.width = this.collider.width = data.w;
			this.height = this.collider.height = data.h;
			if (callback) callback();
		});
	}

	fit(width) {
		if (this.width > width) this.scale(width / this.width);
	}

	setCollider(x, y, w, h) {
		this.collider.position.x = x;
		this.collider.position.y = y;
		this.collider.width = w;
		this.collider.height = h;
	}

	/* scaling sucks, should add this as sub class */
	scale(n) {
		/* need to wait for animation to load, do this later */
		this.width *= n;
		this.height *= n;
		this.collider.width *= n;
		this.collider.height *= n;
		this.animation.widthRatio *= n
		this.animation.heightRatio *= n;
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

	drawDebug() {
		Game.ctx.lineWidth = 1;
		Game.ctx.beginPath();
		Game.ctx.rect(
			this.xy.x + this.collider.position.x,
			this.xy.y + this.collider.position.y,
			this.collider.width, 
			this.collider.height
		);
		const temp = Game.ctx.strokeStyle;
		Game.ctx.strokeStyle = this.debugColor;
		Game.ctx.stroke();
		Game.ctx.strokeStyle = temp;
	}

	/* better name for this ... */
	get xy() {
		if (this.center) {
			return {
				x: this.position.x - (this.center ? this.width / 2 : 0),
				y: this.position.y - (this.center ? this.height / 2 : 0)
			}
		} else {
			return this.position;
		}
	}

	getCenter() {
		if (this.center) {
			return {
				x: this.position.x - (this.center ? this.width/2 : 0),
				y: this.position.y - (this.center ? this.height/2 : 0)
			}
		} else {
			return this.position;
		}
	}

	display(isMap) {
		// if (this.debug) console.log(this.xy);
		// isMap should be editor specific parameter ... 
		if (this.alive && (this.isOnScreen() || isMap)) {
			if (this.debug) this.drawDebug();
			if (this.animation && this.animation.loaded) {
				this.animation.draw(this.xy.x, this.xy.y);
				this.animation.update();
			}
		}
		if (this.displayFunc) this.displayFunc();
	}

	isOnScreen() {
		if (this.xy.x + this.width > 0 && 
			this.xy.y + this.height > 0 &&
			this.xy.x < Game.width &&
			this.xy.y < Game.height)
			return true;
		else
			return false;
	} 

	tap(x, y) {
		if (x > this.xy.x + this.collider.position.x &&
			x < this.xy.x + this.collider.position.x + this.collider.width && 
			y > this.xy.y + this.collider.position.y && 
			y < this.xy.y + this.collider.position.y + this.collider.height) {
			return true;
		} else 
			return false;
	}

	jump(amount) {
		this.jumpAmount += Math.min(-amount / 25, 10);
	}

	collide(other, callback) {
		if (this.alive && other.alive) {
			if (this.xy.x + this.collider.position.x < other.xy.x + other.collider.position.x + other.collider.width &&
			this.xy.x + this.collider.position.x + this.collider.width > other.xy.x + other.collider.position.x &&
			this.xy.y + this.collider.position.y < other.xy.y + other.collider.position.y + other.collider.height &&
			this.xy.y + this.collider.position.y + this.collider.height > other.xy.y + other.collider.position.y) {
				if (callback) callback(this);
				return true;
			} else if (this.bounce) {
				// check next frame
				var nextpos = new Cool.Vector(this.xy.x, this.xy.y);
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

	over(x, y) {
		if (this.alive && this.tap(x,y) && !this.mouseOver && !this.waitToGoOut) {
			this.mouseOver = true;
			if (this.onOver) this.onOver();
			return true;
		} else {
			return false;
		}
	}

	out(x, y) {
		if (this.alive && !this.tap(x,y) && (this.mouseOver || this.waitToGoOut)) {
			this.clickStarted = false;
			this.waitToGoOut = false;
			this.mouseOver = false;
			if (this.onOut) this.onOut();
			return true;
		} else {
			return false;
		}
	}

	down(x, y) {
		if (this.alive && this.tap(x,y)) {
			this.clickStarted = true;
			this.waitToGoOut = true;
			if (this.onDown) this.onDown();
			return true;
		} else {
			return false;
		}
	}

	up(x, y) {
		if (this.alive && this.tap(x,y) && this.clickStarted) {
			this.mouseOver = false;
			if (this.onUp) this.onUp();
			if (this.onClick) this.onClick();
			if (this.func) func();
			return true;
		} else {
			return false;
		}
		this.clickStarted = false;
	}
}
