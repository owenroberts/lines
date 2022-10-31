/*
	imagining renderer src
*/
function Renderer(params) {

	let id = params.id || 'lines';
	let dps = params.dps || 30;
	let retina = params.retina !== undefined ? params.retina : true;
	let dpr = Math.max(1, retina ? window.devicePixelRatio || 1 : 1);
	let scale = params.scale || 1;
	let lineWidth = params.lineWidth || 1;
	let bgColor = params.bgColor || params.bg || false;
	let multiColor = params.multiColor || false;
	let width = params.width;
	let height = params.height;

	const canvas = document.getElementById(id);
	if (!canvas) {
		canvas = document.createElement("canvas");
		canvas.id = id;
		document.body.appendChild(this.canvas);
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) return alert('No canvas context??');
	ctx.lineWidth = lineWidth;
	ctx.miterLimit = 1;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	if (bgColor) canvas.style.backgroundColor = bgColor;
	if (width) canvas.width = width * dpr * scale;
	if (height) canvas.height = height * dpr * scale;

	window.drawCount = 0; // lns.drawCount?
	
	let interval = 1000 / dps;  // time interval between draws
	let timer = performance.now();

	let suspendRender = false;

	const callbacks = [];
	const postTime = [];
	const preTime = [];

	function setDPS(value) {
		dps = value;
		interval = 1000 / dps;
	}

	function setScale(value) {
		scale = value;
		setWidth(width);
		setHeight(height);
		reset();
	}

	function setWidth(value) {
		width = value;
		canvas.width = width * dpr * scale;
		reset();
	}

	function setHeight(value) {
		height = value;
		canvas.height = height * dpr * scale;
		reset();
	}

	function setLineWidth(value) {
		lineWidth = value;
		reset();
	}

	function reset() {
		ctx.scale(1, 1); // prevent multiple scales
		ctx.scale(dpr * scale, dpr * scale);
		canvas.style.zoom = 1 / dpr;
		ctx.lineWidth = lineWidth;
		ctx.miterLimit = 1;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
	}

	function addCallback(func, type) {
		if (!type || type === 'callback') callbacks.push(func);
		if (type === 'pre') preTime.push(func);
		if (type === 'post') postTime.push(func);
	}

	function setSuspend(value) {
		suspendRender = value;
	}

	function update(time) {

		if (preTime.length) {
			for (let i = 0; i < preTime.length; i++) {
				preTime[i]();
			}
		}
	
		if (performance.now() > interval + timer || time === 'capture') {
			timer = performance.now();
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (let i = 0; i < callbacks.length; i++) {
				callbacks[i](time);
			}

			window.drawCount++;
		}

		if (postTime.length) {
			for (let i = 0; i < postTime.length; i++) {
				postTime[i](time);
			}
		}
		
		if (suspendRender) return;
		window.requestAnimFrame(update);
	}

	function suspend() {
		suspendRender = true;
	}

	function start() {
		window.requestAnimFrame(update);
		if (suspendRender) suspendRender = false;
	}

	return { 
		canvas, ctx, reset, start, suspend, update, 
		addCallback, 
		setSuspend,
		setWidth, setHeight, setScale, setDPS, setLineWidth,
		getProps() {
			return { width, height, scale, lineWidth, bgColor, dps };
		}
	};
}

window.Lines.Renderer = Renderer;