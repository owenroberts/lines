function setupAnimateInterface(ui) {

	const container = document.getElementById('container');

	ui.toggleTimelineView = function() {
		const timeline = document.getElementById('timeline-panel');
		const play = document.getElementById('play-panel');
		if (this.isOn) {
			container.classList.add('timeline-display');
			container.appendChild(timeline);
			container.appendChild(play);

		} else {
			container.classList.remove('timeline-display');
			const panels = document.getElementById('panels');
			panels.appendChild(timeline);
			panels.appendChild(play);
		}

	};

	ui.toggleRL = function() {
		if (this.isOn) container.classList.add('right');
		else container.classList.remove('right');
	};

	ui.cursorToggle = function() {
		if (lns.canvas.canvas.classList.contains('no-cursor')) 
			lns.canvas.canvas.classList.remove('no-cursor');
		else 
			lns.canvas.canvas.classList.add('no-cursor');
	};

	ui.baseFontSize = 11; 
	ui.updateScale = function(value) {
		if (value) ui.baseFontSize = +value;
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
