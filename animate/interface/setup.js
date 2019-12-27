function setupAnimateInterface(ui) {

	ui.toggleRL = function() {
		if (this.isOn) lns.canvas.canvas.parentElement.classList.add('right');
		else lns.canvas.canvas.parentElement.classList.remove('right');
	};

	ui.updateFIO = function(data, params) {

		ui.faces.title.value = lns.files.fileName.split('/').pop().replace('.json', '');
		ui.faces.fps.value = data.fps;

		ui.faces.width.value = data.w;
		ui.faces.height.value = data.h;

		lns.anim.layers.forEach(layer => {
			if (layer) {
				ui.faces.c.addColor(layer.c);
				ui.faces.c.value = layer.c;
			}
		});

		if (data.bg) ui.faces.bgColor.value = data.bg;
		ui.update();
	};

	ui.update = function() {
		ui.play.update();
		ui.layers.update();
		ui.drawings.update();
		ui.states.update(); 
	};
}
