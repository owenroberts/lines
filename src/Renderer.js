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
	let clearBg = params.clearBg !== undefined ? params.clearBg : true;

	const canvas = document.getElementById(id);
	if (!canvas) {
		canvas = document.createElement("canvas");
		canvas.id = id;
		document.body.appendChild(this.canvas);
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) return alert('No canvas context??');
	ctx.lineWidth = lineWidth;
	if (params.lineColor) this.ctx.strokeStyle = params.lineColor;
	canvasUpdate();

	if (bgColor) canvas.style.backgroundColor = bgColor;
	if (width) canvas.width = width * dpr * scale;
	if (height) canvas.height = height * dpr * scale;

	if (params.zoom) {
		let zoom = params.zoom;
		// necessary ?
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
	}

	if (params.usePixels) {
		Object.assign(Lines.prototype, PixelMixin);
	}

	if (params.antiFactor) { // 3 is good here
		Object.assign(Lines.prototype, AntiMixin);
		canvas.width = width * dpr * params.antiFactor;
		canvas.height = height * dpr * params.antiFactor;
		if (params.smallCanvas) {
			canvas.style.width = (width * dpr) + 'px';  
			canvas.style.height = (height * dpr) + 'px';
		}
		ctx.lineWidth = lineWidth * params.antiFactor;
	}

	if (params.svgFilter) {
		const svgns = "http://www.w3.org/2000/svg";
		const svg = document.createElementNS(svgns, "svg");
		const defs = document.createElementNS(svgns, "defs");
		const filter = document.createElementNS(svgns, "filter");
		const feComponentTransfer = document.createElementNS(svgns, "feComponentTransfer");
		const feFuncA = document.createElementNS(svgns, "feFuncA");

		svg.setAttribute('style', 'position:absolute;z-index:-1;');
		svg.setAttribute('width', '0');
		svg.setAttribute('height', '0');

		document.body.appendChild(svg);
		svg.appendChild(defs);
		defs.appendChild(filter);

		filter.setAttribute('id', 'remove-alpha');
		filter.setAttribute('x', '0');
		filter.setAttribute('y', '0');
		filter.setAttribute('width', '100%');
		filter.setAttribute('height', '100%');
		filter.appendChild(feComponentTransfer);
		feComponentTransfer.appendChild(feFuncA);

		feFuncA.setAttribute('type', 'discrete');
		feFuncA.setAttribute('tableValues', '0 1');

		ctx.filter = 'url(#remove-alpha)';
	}

	window.drawCount = 0; // lns.drawCount? ... window.updateCount ...
	
	let interval = 1000 / dps;  // time interval between updates
	let updateTime = performance.now();

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
		ctx.lineWidth = lineWidth;
		canvasUpdate(); // idk
	}

	function canvasUpdate() {
		ctx.miterLimit = 1;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
	}

	function reset() {
		// console.log('reset');
		ctx.scale(1, 1); // prevent multiple scales
		ctx.scale(dpr * scale, dpr * scale);
		canvas.style.zoom = 1 / dpr;
		ctx.lineWidth = lineWidth;
		canvasUpdate();
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
	
		if (time > interval + updateTime || time === 'capture') {
			// updateTime = time;
			// adjust for fps being off
			updateTime = time - ((time - updateTime) % interval);

			if (clearBg) ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (let i = 0; i < callbacks.length; i++) {
				callbacks[i](time - updateTime);
			}

			window.drawCount++;
		}

		if (postTime.length) {
			for (let i = 0; i < postTime.length; i++) {
				postTime[i]();
			}
		}
		
		if (suspendRender) return;
		window.requestAnimFrame(update);
	}

	function suspend() {
		suspendRender = true;
	}

	function start() {
		updateTime = performance.now();
		window.requestAnimFrame(update);
		if (suspendRender) suspendRender = false;
	}

	return { 
		canvas, ctx, reset, start, suspend, update, 
		addCallback, 
		setSuspend,
		setWidth, setHeight, setScale, setDPS, setLineWidth,
		getProps() {
			return { width, height, scale, lineWidth, bgColor, dps, multiColor };
		}
	};
}

window.Lines.Renderer = Renderer;