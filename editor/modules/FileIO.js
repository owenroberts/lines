/*
	file module to save project settings
*/

function FileIO(app, params) {
	const self = this;
	Object.assign(FileIO.prototype, app.modulePrototype);

	let projectName = params.projectName || 'Animation_' + new Date().toDateString().replace(/ /g, '-');

	this.addProp('projectName', {
		get: () => { return projectName },
		set: (value) => {
			projectName = value;
			document.title = projectName + ' ~ animation editor';
		}
	})

	function loadData(data) {
		app.footage.load(data.footage);
	}

	this.save = function() {
		const json = { v: '0.1' };
		json.footage = app.footage.filePaths;
		const jsonFile = JSON.stringify(json);
		const blob = new Blob([jsonFile], { type: "application/x-download;charset=utf-8" });
		saveAs(blob, projectName + '.json');
	};

	this.load = function(fileName) {
		console.log(fileName);
		self.projectName = fileName.split('/').pop().replace('.json', '');

		fetch(fileName)
			.then(response => { return response.json(); }) 
			.then(data => { loadData(data); })
			.catch(err => { console.error('err', err.message ); });
	};
}