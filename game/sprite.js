function Sprite(x, y, w, h) {
	var self = this;
	ctx = Game.ctx;
	this.position = new Cool.Vector(x, y);
	/* just use fucking width and height */
	this.size = new Cool.Vector(w, h);
	this.collider = {
		position: new Cool.Vector(0, 0),
		size: new Cool.Vector(w, h)
	}
	this.jumpAmount = 0;
	this.velocity = new Cool.Vector(0,0);
	this.alive = true;
	this.bounceAmount = new Cool.Vector(0,0);
	this.bounce = false;
	this.animation = null;
	this.debug = false;
	this.frameCount = -1;	
	this.wiggleAmount = -1;
	this.bkg = false; /* draw a filled in outline */

	this.addAnimation = function(src) {
		self.animation = new Animation(src);
		if (!self.size.x) {
			/* load animation size */
			self.animation.load(true, function(w, h) {
				self.size.x = self.collider.size.x = w;
				self.size.y = self.collider.size.y = h;
			});
		} else self.animation.load(this.size);
		if (this.debug) self.animation.debug = true;
	};
	this.setCollider = function(x, y, w, h) {
		this.collider.position.x = x;
		this.collider.position.y = y;
		this.collider.size.x = w;
		this.collider.size.y = h;
	};
	this.scale = function(n) {
		/* need to wait for animation to load, do this later */
		this.animation.widthRatio = this.size.x / (this.width*n);
		this.animation.heightRatio = this.size.y / (this.height*n);
		// console.log(this.size.x);
		this.size.x *= n;
		// console.log(this.size.x);
		this.size.y *= n;
		this.collider.size.x *= n;
		this.collider.size.y *= n;
	}
	this.update = function() {
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
	};
	this.display = function() {
		if (this.alive) {
			if (this.debug) {
				ctx.beginPath();
				ctx.lineWidth = 1;
				ctx.rect(
					this.position.x + this.collider.position.x, 
					this.position.y + this.collider.position.y, 
					this.collider.size.x, 
					this.collider.size.y
				);
				if (ctx.strokeStyle != "#00ffbb") ctx.strokeStyle = "#00ffbb";
				ctx.stroke();
			}
			if (this.animation && this.animation.loaded && this.frameCount != 0) {
				if (this.bkg) this.animation.drawBkg(this.position.x, this.position.y);
				else this.animation.draw(this.position.x, this.position.y);
				if (this.frameCount > 0) this.frameCount--;
			}
		}
	};
	this.displayTwo = function(other) {
		if (this.alive) {
			if (this.animation && this.animation.loaded && this.frameCount != 0) {
				this.animation.drawTwo(other.animation);
				if (this.frameCount > 0) this.frameCount--;
			}
		}
	}
	this.jump = function(amount) {
		this.jumpAmount += Math.min(-amount / 25, 10);
	};
	this.tap = function(x, y) {
		if (x > this.position.x + this.collider.position.x &&
			x < this.position.x + this.collider.position.x + this.collider.size.x && 
			y > this.position.y + this.collider.position.y && 
			y < this.position.y + this.collider.position.y + this.collider.size.y) {
			return true;
		} else return false;
	}
	this.collide = function(other, callback) {
		if (this.alive && other.alive) {
			if (this.position.x + this.collider.position.x < other.position.x + other.collider.position.x + other.collider.size.x &&
				this.position.x + this.collider.position.x + this.collider.size.x > other.position.x + other.collider.position.x && 
				this.position.y + this.collider.position.y < other.position.y + other.collider.position.y + other.collider.size.y && 
				this.position.y + this.collider.position.y + this.collider.size.y > other.position.y + other.collider.position.y) {
				if (callback) callback(this);
				return true;
			} else if (this.bounce) {
				// check next frame
				var nextpos = new Cool.Vector(this.position.x, this.position.y);
				nextpos.add(this.velocity);
				if (nextpos.x < other.position.x + other.size.x &&
				nextpos.x + this.size.x > other.position.x  && 
				nextpos.y < other.position.y + other.size.y && 
				nextpos.y + this.size.y > other.position.y) {
					var xoff = (this.position.x + this.size.x) - other.position.y;
					var yoff = (this.position.y + this.size.y) - other.position.y;
					if ( Math.abs(xoff) < Math.abs(yoff) ) {
						this.position.x = other.position.x - this.size.x;
					} else {
						this.position.y = other.position.y - this.size.y;
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
	};
	this.outside = function(other) {
		var next = this.position.copy();
		var nextCollider = this.collider.position.copy();
		next.add(nextCollider);
		next.add(this.velocity);
		var nextSize = this.collider.size.copy();
		if (next.x < other.position.x + other.collider.position.x ||
			next.x + nextSize.x > other.position.x + other.collider.position.x + other.collider.size.x ||
			next.y < other.position.y + other.collider.position.y ||
			next.y + nextSize.y > other.position.y + other.collider.position.y + other.collider.size.y) {
			return true;
		} else {
			return false;
		}
	};
	this.dies = function() {
		this.alive = false;
		this.animation.play = false;
		var p = this;
		setTimeout( function() {
			//p.alive = true;
			//p.pos = new Cool.Vector(10, 20);
		}, 1000);
	};
	this.reset = function(widhtMin, widthMax, heightMin, heightMax) {
		this.position.x = Cool.randomInt(widhtMin, widthMax - this.size.x);
		this.position.y = Cool.randomInt(heightMin, heightMax);
	};
}
