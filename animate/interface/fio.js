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

	this.update = function(data, params) {
		self.title.value = lns.files.fileName.split('/').pop().replace('.json', '');
		console.log(self.title.el.value);
		console.log(self.title.value)
		console.log(self.title);
		ui.faces.fps.value = data.fps;

		lns.anim.layers.forEach(layer => {
			if (layer) {
				ui.faces.c.addColor(layer.c);
				ui.faces.c.value = layer.c;
			}
		});

		if (data.bg) lns.ui.faces.bgColor.value = data.bg;
		if (params.load) lns.ui.settings.canvasLoad();
		ui.update();
	};
}