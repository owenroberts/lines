class Stats {
	constructor(ctx, labels) {
		this.ctx = ctx;
		this.ctx.font = 'lighter 11px sans-serif';
		this.stats = {};
		labels.forEach(label => {
			this.stats[label] = [];
		});
	}

	create(label) {
		this.stats[label] = [];
	}

	update(label, time, prevTime) {
		this.stats[label].push( 1000 / (time - prevTime) );
		if (this.stats[label].length > 20) this.stats[label].shift();
	}

	draw() {
		// bg
		this.ctx.fillStyle = 'rgba(0,0,0,0.75)';
		this.ctx.fillRect(window.innerWidth - 65, 0, 50, 40);

		this.ctx.font = 'lighter 11px sans-serif';
		this.ctx.fillStyle = 'rgba(100,255,200)';

		let x = window.innerWidth - 60;
		let y = 15;

		for (const label in this.stats) {
			const stat = this.stats[label];
			const text = `${label} ${Math.round(stat.reduce((n,s) => n + s, 0) / stat.length )}`;

			this.ctx.fillText(text, x, y);
			y += 20;
		}
	}
}