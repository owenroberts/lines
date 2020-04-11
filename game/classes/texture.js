class Texture {
	constructor(params, debug) {
		this.scenes = params.scenes;
		this.locations = params.locations || [];
		this.frame = params.frame || 'index';
		this.debug = debug;
		this.center = params.center || false;
		
		this.offset = {x: 0, y: 0};

		if (params.json) this.addJSON(params.json);

		if (params.src) {
			fetch(params.src)
				.then(response => { return response.json(); })
				.then(json => this.addJSON);
		}
	}

	addLocation(index, x, y) {
		this.animation.createNewState(`f-${index}`, index, index);
		this.locations.push({ x: x, y: y, i: index });
	}

	addJSON(json) {
		// this.json = json;
		this.animation = new Anim();
		this.animation.loadJSON(json);
		this.animation.debug = this.debug;
		
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
			if (x + this.animation.width > 0 && x < Game.width && y + this.animation.height > 0 && y < Game.height) {
				if (this.locations[i].i) this.animation.state = `f-${this.locations[i].i}`;
				this.animation.draw(x, y);
			}

			
		}
	}

	update(offset) {
		this.offset = offset;
	}
}