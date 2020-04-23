/*
	still figuring this out
	rn just fps and draw/sec
	want to add millis
*/

class Stats {
	constructor(ctx, width) {
		this.ctx = ctx;
		this.width = width;
		this.stats = {};
	}

	create(label, time) {
		this.stats[label] = {
			count: 0,
			startTime: time,
			value: 0
		}
	}

	update(label, time) {
		// this.stats[label].push(time);
		// if (this.stats[label].length > 20) this.stats[label].shift();
	
		const stat = this.stats[label];
		// if (label == 'draw') console.log(time, stat.startTime, stat.count);
		stat.count++;
		stat.value = Math.round(1000 / ((time - stat.startTime) / stat.count) * 100) / 100;
	}

	draw() {
		// bg
		this.ctx.fillStyle = 'rgba(0,0,0,0.75)';
		this.ctx.fillRect(this.width - 65, 0, 60, 40);

		this.ctx.font = 'lighter 11px sans-serif';
		this.ctx.fillStyle = 'rgba(100,255,200)';

		let x = this.width - 60;
		let y = 15;

		for (const label in this.stats) {
			const stat = this.stats[label];
			this.ctx.fillText(`${label} ${stat.value}`, x, y);
			y += 20;
		}
	}
}