/*
	draws rect lines using breneham (sp?) instead of canvas lines
*/

class PixelLines extends Lines {
	constructor(ctx, dps, multiColor, pixelSize) {
		super(ctx, dps, multiColor);

		// pixel branch, pixels are default
		this.pixelSize = pixelSize || 1;
		this.pixelM = this.pixelSize;  // multiplier
		// set w scale func
	}

	finish() {
		this.ctx.fill();
	}

	setColor(color) {
		if (this.ctx.fillStyle !== color) this.ctx.fillStyle = color;
	}

	drawLines(s, e, props, off) {
		if (props.segmentNum === 1) { // i rarely use n=1 tho
			this.simplePixelLine(
				props.x + s.x + off[0].x,
				props.y + s.y + off[0].y,
				props.x + e.x + off[1].x,
				props.y + e.y + off[1].y
			);
		} else {
			const v = new Cool.Vector(e.x, e.y);
			v.subtract(s);
			v.divide(props.segmentNum);
			
			for (let k = 0; k < props.segmentNum; k++) {
				const p0 = s.clone().add(v.clone().multiply(k));
				const p1 = s.clone().add(v.clone().multiply(k + 1));

				const index = props.breaks ? k : k + 1;
				this.simplePixelLine(
					props.x + p0.x + off[k].x,
					props.y + p0.y + off[k].y,
					props.x + p1.x + off[k + 1].x,
					props.y + p1.y + off[k + 1].y,
				);
			}
		}
	}

	setPixelM(scale) {
		this.pixelM = Math.ceil(this.pixelSize * scale);
		// console.log(this.pixelSize, scale, this.pixelM);
	}

	simplePixelLine(x0, y0, x1, y1) {

		x0 = Math.round(x0 / this.pixelSize);
		y0 = Math.round(y0 / this.pixelSize);
		x1 = Math.round(x1 / this.pixelSize);
		y1 = Math.round(y1 / this.pixelSize);
		let dx = Math.abs(x1 - x0);
		let dy = Math.abs(y1 - y0);
		let sx = x0 < x1 ? 1 : -1;
		let sy = y0 < y1 ? 1 : -1;
		let err = dx - dy;

		while(true) {
			this.ctx.rect(x0 * this.pixelM, y0 * this.pixelM, this.pixelM, this.pixelM);
			if (x0 === x1 && y0 === y1) break;
			let e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x0 += sx;
			}
			if (e2 < dx) {
				err += dx;
				y0 += sy;
			}
		}
	}


	pixelLine(x1, y1, x2, y2) {
		const size = this.ctx.lineWidth;
		x1 = Math.round(x1);
		x2 = Math.round(x2);
		y1 = Math.round(y1);
		y2 = Math.round(y2);

		const dx = Math.abs(x2 - x1);
		const sx = x1 < x2 ? 1 : -1;
		const dy = Math.abs(y2 - y1);
		const sy = y1 < y2 ? 1 : -1;

		let error, len, rev, count = dx;

		if (dx > dy) {
			error = dx / 2;
			rev = x1 > x2 ? 1 : 0;
			if (dy > 1) {
				error = 0;
				count = dy - 1;
				do {
				  len = error / dy + 2 | 0;
				  this.ctx.rect(x1 - len * rev, y1, len, size);
				  x1 += len * sx;
				  y1 += sy;
				  error -= len * dy - dx;
				} while (count--);
			}
			if (error > 0) this.ctx.rect(x1, y2, x2 - x1, size);
		} else if (dx < dy) {
				error = dy / 2;
				rev = y1 > y2 ? 1 : 0;
				if (dx > 1) {
					error = 0;
					count--;
					do {
						len = error / dx + 2 | 0;
						this.ctx.rect(x1, y1 - len * rev, size, len);
						y1 += len * sy;
						x1 += sx;
						error -= len * dx - dy;
					} while (count--);
				}
				if (error > 0) this.ctx.rect(x2, y1, size, y2 - y1);
		} else {
			do {
				this.ctx.rect(x1, y1, size, size);
				x1 += sx;
				y1 += sy;
			} while (count--);
		}
	}

}