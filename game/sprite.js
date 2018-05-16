function Sprite(x, y, w, h) {
	var self = this;
	ctx = Game.ctx;
	this.position = new Cool.Vector(x, y);
	this.width = w;
	this.height = h;
	this.collider = {
		position: new Cool.Vector(0, 0),
		width: w,
		height: h
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

	this.addAnimation = function(src, callback) {
		self.animation = new Animation(src);
		if (!self.width) {
			/* load size from animation data and set sprite size */
			self.animation.load(true, function(w, h) {
				self.width = self.collider.width = w;
				self.height = self.collider.height = h;
				if (callback)
					callback();
			});
		} else {
			self.animation.load({w: this.width, h: this.height});
		}
		if (this.debug) 
			self.animation.debug = true;
	};
	this.setCollider = function(x, y, w, h) {
		this.collider.position.x = x;
		this.collider.position.y = y;
		this.collider.width = w;
		this.collider.height = h;
	};
	this.scale = function(n) {
		/* need to wait for animation to load, do this later */
		this.animation.widthRatio = this.width / (this.width*n);
		this.animation.heightRatio = this.height / (this.height*n);
		this.width *= n;
		this.height *= n;
		this.collider.width *= n;
		this.collider.height *= n;
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
					this.collider.width, 
					this.collider.height
				);
				if (ctx.strokeStyle != "#00ffbb") 
					ctx.strokeStyle = "#00ffbb";
				ctx.stroke();
			}
			if (this.animation && this.animation.loaded && this.frameCount != 0) {
				if (this.bkg) 
					this.animation.drawBkg(this.position.x, this.position.y);
				else 
					this.animation.draw(this.position.x, this.position.y);
				if (this.frameCount > 0) 
					this.frameCount--;
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
			x < this.position.x + this.collider.position.x + this.collider.width && 
			y > this.position.y + this.collider.position.y && 
			y < this.position.y + this.collider.position.y + this.collider.height) {
			return true;
		} else return false;
	}
	this.collide = function(other, callback) {
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
	};
	this.outside = function(other) {
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
		this.position.x = Cool.randomInt(widhtMin, widthMax - this.width);
		this.position.y = Cool.randomInt(heightMin, heightMax);
	};
	this.center = function() {
		this.position.x -= this.width / 2;
		this.position.y -= this.height / 2;
	};
}
