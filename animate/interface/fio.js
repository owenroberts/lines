function FilesInterface(ui) {
	const self = this;

	this.title = new UIText({ 
		id:"title",
		callback: function() {
			lns.files.saveFile(self.title.value);
		}
	});

	ui.keys['s'] = new UIButton({
		id: "save",
		callback: function() {
			lns.files.saveFile(self.title.value, false, function(title) {
				self.title.value = title;
			});
		},
		key: "s"
	});

	ui.keys['shift-s'] = new UIButton({
		id: "save-frame",
		callback: function() {
			lns.files.saveFile(self.title.value, true, function(filename) {
				self.title.value = filename.split("/").pop();
			});
		},
		key: "shift-s"
	});

	ui.keys['o'] = new UIButton({
		id: "open",
		callback: function() {
			const openFile = document.getElementById('open-file');
			openFile.click();
			openFile.onchange = function() {
				lns.files.readFile(openFile.files, self.update);
			};
		},
		key: "o"
	});

	ui.keys['shift-o'] = new UIButton({
		id: 're-open',
		callback: lns.files.reOpenFile,
		key: 'shift-o'
	});

	/* params from files module - does it need to be separate? */
	this.update = function(data, params) {

		/* rename faces to props? also could use module ids 
			this updates a lot more than just the files interface , not the right place */

		self.title.value = lns.files.fileName.split('/').pop().replace('.json', '');
		ui.faces.fps.value = data.fps;
		lns.ui.faces.stateSelector.setOptions(Object.keys(data.s));

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