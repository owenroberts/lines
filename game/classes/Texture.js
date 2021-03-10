/*
	draws frames from one animation in multuple places (locations)	
*/

class Texture {
	constructor(params, debug) {
		this.locations = [];
		this.frame = params.frame || 'index'; // bad name
		this.debug = debug;
		this.center = params.center || false;
		
		this.offset = new Cool.Vector(0, 0);
		if (params.animation) this.animation = params.animation;

		if (params.locations.length > 0) {
			this.addLocations(params.locations)
		}
	}

	addLocation(x, y, index) {
		const loc = new Cool.Vector(x, y);
		if (index !== undefined) {
			this.animation.createNewState(`f-${index}`, index, index);
			loc.i = index;
		}  else if (this.frame == 'randomIndex') {
			let r = Cool.randomInt(0, this.animation.endFrame);
			this.animation.createNewState(`f-${r}`, r, r);
			loc.i = r;
		}
		this.locations.push(loc);
	}

	addLocations(locations) {
		this.locations.push(...locations);
		for (let i = 0; i < this.locations.length; i++) {
			if (this.frame == 'index') {
				this.locations[i].i = i;
				this.animation.createNewState(`f-${i}`, i, i);
			}
			else if (this.frame == 'random') {
				this.animation.randomFrames = true;
			}
			else if (this.frame == 'randomIndex') {
				let randomIndex = Cool.randomInt(0, this.animation.endFrame);
				this.locations[i].i = randomIndex;
				this.animation.createNewState(`f-${randomIndex}`, randomIndex, randomIndex);
			}
		}
	}

	display() {
		for (let i = 0; i < this.locations.length; i++) {
			let x = this.locations[i].x + this.offset.x;
			let y = this.locations[i].y + this.offset.y;
			if (this.center) {
				x -= this.animation.width / 2;
				y -= this.animation.height / 2;
			}

			//  figure out centering later, only draw textures on screen
			if (x + this.animation.width > 0 && x < GAME.width && 
				y + this.animation.height > 0 && y < GAME.height) {
				if (this.locations[i].i !== undefined) this.animation.state = `f-${this.locations[i].i}`;
				this.animation.draw(x, y, GAME.suspend);
			}
		}
	}

	update(offset) {
		this.offset.x = offset.x;
		this.offset.y = offset.y;
	}
}