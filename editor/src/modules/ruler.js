function Ruler() {
	const self = this;

	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;

	this.update = function() {
		
	};

	this.display = function(ctx) {
		ctx.strokeStyle = '#bb11ff';
		ctx.strokeRect(m.x, m.y, m.w, m.h);
		
		ctx.font = '48px monaco';
		ctx.fillText(Math.floor(m.w), m.x + m.w/2, m.y - 10);
		ctx.fillText(Math.floor(m.h), m.x - 20, m.y + m.h/2);
	};
}