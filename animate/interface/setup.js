function setupAnimateInterface(ui) {

	ui.toggleRL = function() {
		if (this.isOn) lns.canvas.canvas.parentElement.classList.add('right');
		else lns.canvas.canvas.parentElement.classList.remove('right');
	};

	ui.cursorToggle = function() {
		if (lns.canvas.canvas.classList.contains('no-cursor')) 
			lns.canvas.canvas.classList.remove('no-cursor');
		else 
			lns.canvas.canvas.classList.add('no-cursor');
	};

	ui.baseFontSize = 11; 
	ui.updateScale = function(value) {
		ui.baseFontSize = +value;
		document.body.style.setProperty('--base-font-size', ui.baseFontSize);
	};

	ui.updateFIO = function(data, params) {

		ui.faces.title.value = lns.files.fileName.split('/').pop().replace('.json', '');
		ui.faces.fps.value = data.fps;
		document.title = `${ui.faces.title.value} ~ animate`;

		ui.faces.width.value = data.w;
		ui.faces.height.value = data.h;

		lns.anim.layers.forEach(layer => {
			if (layer) {
				ui.faces.color.addColor(layer.color);
				ui.faces.color.value = layer.color;
			}
		});

		if (data.bg) ui.faces.bgColor.value = data.bg;
		ui.update();
	};

	ui.update = function() {
		ui.timeline.update();
		ui.drawings.update();
		ui.states.update(); 
	};

}
