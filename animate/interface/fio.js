function FilesInterface(ui) {
	const self = this;

	/* params from files module - does it need to be separate? */
	this.update = function(data, params) {

		/* rename faces to props? also could use module ids 
			this updates a lot more than just the files interface , not the right place */

		// self.title.value = lns.files.fileName.split('/').pop().replace('.json', '');
		ui.faces.title.value = lns.files.fileName.split('/').pop().replace('.json', '');
		ui.faces.fps.value = data.fps;

		for (const state in data.s) {
			lns.ui.faces.stateSelector.addOption(state);
		}

		lns.ui.faces.width.value = data.w;
		lns.ui.faces.height.value = data.h;

		lns.anim.layers.forEach(layer => {
			if (layer) {
				ui.faces.c.addColor(layer.c);
				ui.faces.c.value = layer.c;
			}
		});

		if (data.bg) lns.ui.faces.bgColor.value = data.bg;
		ui.update();
	};
}