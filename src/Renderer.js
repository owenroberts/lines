/*
	imagining renderer src
*/
function Renderer(params) {
	const { id, retina, scale, lineWidth, bgColor, width, height } = params;

	const canvas = document.getElementById(id);
	// create canvas if !canvas

	let dpr = retina ? window.devicePixelRatio || 1 : 1;
	// let scale = 1;
	// let lineWidth = 1;

	const ctx = this.canvas.getContext('2d');
	ctx.lineWidth = lineWidth;
	ctx.miterLimit = 1;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	canvas.style.backgroundColor = bgColor;
	canvas.width = width * dpr * scale;
	canvas.height = height * dpr * scale;

	function reset() {
		ctx.scale(1, 1); // prevent multiple scales
		ctx.scale(dpr * scale, dpr * scale);
		canvas.style.zoom = 1 / dpr;
		ctx.lineWidth = lineWidth;
		ctx.miterLimit = 1;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
	}


	return { canvas, ctx, reset };
}