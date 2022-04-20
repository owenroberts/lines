/*
	overwrite lines methods to render pixels
*/

const PixelMixin = {

	init() {
		this.pixelSize = GAME.pixelSize || GAME.lineWidth || 2;
	},

	finish() {
		this.ctx.fill();
	},

	setColor(color) {
		if (this.ctx.fillStyle !== color) this.ctx.fillStyle = color;
	},

	getColor() {
		return this.ctx.fillStyle;
	},

	drawLines(s, e, props) {
		if (props.segmentNum === 1) { // i rarely use n=1 tho
			this.simplePixelLine(
				props.x + s[0][0] + s[1][0][0],
				props.y + s[0][1] + s[1][0][1],
				props.x + e[0][0] + s[1][1][0],
				props.y + e[0][1] + s[1][1][1]
			);
		} else {

			const v = [
				(e[0][0] - s[0][0]) / props.segmentNum,
				(e[0][1] - s[0][1]) / props.segmentNum,
			];

			for (let k = 0; k < props.segmentNum; k++) {
				const p0 = [s[0][0] + (v[0] * k), s[0][1] + (v[1] * k)];
				const p1 = [s[0][0] + (v[0] * (k + 1)), s[0][1] + (v[1] * (k + 1))];
				// add offset to segment points
				let o = [0, 0]; // 0, 0 to prevent missing offset errors
				if (k === props.segmentNum - 1 && !props.breaks) {
					o = e[1][0];
				} else if (s[1][k]) {
					o = s[1][k];
					if (!o) console.log('else k', k, o, s, e); // leave debug here
				}
				this.simplePixelLine(
					props.x + p0[0] + o[0],
					props.y + p0[1] + o[1],
					props.x + p1[0] + o[0],
					props.y + p1[1] + o[1]
				);
			}
		}
	},

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
			this.ctx.rect(x0 * this.pixelSize, y0 * this.pixelSize, this.pixelSize, this.pixelSize);
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
	},

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

};