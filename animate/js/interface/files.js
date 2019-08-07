function FilesInterface(ui) {
	const self = this;

	this.title = new UI({ id:"title" });

	ui.keys['s'] = new UIButton({
		id: "save",
		callback: function() {
			lns.files.saveFile(self.title.getValue(), false, function(title) {
				self.title.setValue(title);
			});
		},
		key: "s"
	});

	ui.keys['shift-s'] = new UIButton({
		id: "save-frame",
		callback: function() {
			lns.files.saveFile(self.title.getValue(), true, function(filename) {
				self.title.setValue(filename.split("/").pop());
			});
		},
		key: "shift-s"
	});

	ui.keys['o'] = new UIButton({
		id: "open",
		callback: lns.files.loadFile,
		key: "o"
	});

	ui.keys['shift-o'] = new UIButton({
		id: 're-open',
		callback: lns.files.reOpenFile,
		key: 'shift-o'
	});
}