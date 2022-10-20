/*
	display background image for tracing ...
	should this be possible in deployed version?
	can use css to show an image ...
	use css for this ?
*/

function BackgroundImage() {

	let img = new Image();
	let show = true;
	let x = 0;
	let y = 0;
	let width = 0;
	let height = 0;
	let size = 1;
	let rotation = 0;

	function loadImage(url) {
		img.src = url;
		img.onload = function() {
			width = img.width;
			height = img.height;
		}
	}

	function display() {
		if (img.src && show) {
			if (rotation > 0) {
				lns.canvas.ctx.save();
				lns.canvas.ctx.rotate(rotation * Math.PI / 180);
			}
			lns.canvas.ctx.drawImage(img, x, y, size * width, height * size);
			if (rotation > 0) lns.canvas.ctx.restore();
		}
	}

	function connect() {
		// none of this is saved in interface bc i don't use this a lot but could be if i wanted to for long term tracing project

		// maybe create some kind of file/url loader here
		lns.ui.addUI({
			type: 'UIText',
			placeholder: 'URL',
			callback: value => { loadImage(value); },
		}, 'bgImage');

		// need to add multiple uis without properties
		// test array
		lns.ui.addUI({
			value: show,
			key: 'alt-b',
			onText: 'Hide',
			offText: 'Show',
			callback: value => { show = value; },
		});

		lns.ui.addUI({
			type: 'UINumberRange',
			value: x,
			label: 'X',
			range: [-1024, 1024],
			callback: value => { x = value; },
			// input: 'x-range' ??
		});

		lns.ui.addUI({
			type: 'UINumberRange',
			value: y,
			label: 'Y',
			range: [-1024, 1024],
			callback: value => { y = value; },
		});

		lns.ui.addUI({
			type: 'UINumberRange',
			value: size,
			label: 'Size',
			range: [0.1, 2],
			step: 0.1,
			callback: value => { size = value; },
			// input: 'x-range' ??
		});

		lns.ui.addUI({
			type: 'UINumberRange',
			value: rotation,
			label: 'Rotation',
			range: [0, 360],
			callback: value => { rotation = value; },
			// input: 'x-range' ??
		});
	}

	return { connect, display };
}