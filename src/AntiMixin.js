/*
	scaling canvas to get anti-anti-alias effect
*/

const AntiMixin = {

	init() {
		this.antiFactor = GAME.antiFactor;
	},

	drawLines(s, e, props) {

		// move ctx to start point + start offset
		// s,e = [point, offset] = [[x, y], [offset1, offset2]] = [[x,y], [[x,y], [x,y]]]
		this.ctx.moveTo(
			(props.x + s[0][0] + s[1][0][0]) * this.antiFactor,
			(props.y + s[0][1] + s[1][0][1]) * this.antiFactor
		);

		// if its just one line draw to end
		if (props.segmentNum === 1) { // i rarely use n=1 tho
			this.ctx.lineTo( 
				(props.x + e[0][0] + e[1][0][0]) * this.antiFactor,
				(props.y + e[0][1] + e[1][0][1]) * this.antiFactor
			);
			return;
		}

		// get direction between s and e to divide into vector and distance
		const v = [
			(e[0][0] - s[0][0]) / props.segmentNum,
			(e[0][1] - s[0][1]) / props.segmentNum,
		];	
		
		// segment end points
		for (let k = 1; k < props.segmentNum; k++) {
			// line to start + vector * k 
			const p = [
				s[0][0] + v[0] * k,
				s[0][1] + v[1] * k
			];

			// add offset to segment points
			let o = [0, 0]; // 0, 0 to prevent missing offset errors
			if (k === props.segmentNum - 1 && !props.breaks) {
				o = e[1][0];
			} else if (s[1][k]) {
				o = s[1][k];
				if (!o) console.log('else k', k, o, s, e); // leave debug here
			}
			
			// finish line
			this.ctx.lineTo( 
				(props.x + p[0] + v[0] + o[0]) * this.antiFactor,
				(props.y + p[1] + v[1] + o[1]) * this.antiFactor
			);
		}
	}
};

window.Lines.AntiMixin = AntiMixin;

