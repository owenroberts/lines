/*
	file module to save project settings
*/

function FileIO(app, params) {
	Object.assign(FileIO.prototype, ModuleMixin);
	const self = this;

	let projectName = params.projectName || 'Animation_' + new Date().toDateString().replace(/ /g, '-');

	this.addProp('projectName', {
		get: () => { return projectName },
		set: (value) => {
			projectName = value;
			document.title = projectName + ' ~ animation editor';
		}
	});

	function loadData(data, callback) {
		app.footage.load(data.footage, true, () => {
			loadCompositions(data.compositions);
			app.timeline.activeComposition = data.activeComposition;
			if (callback) callback();
			app.timeline.drawUI(); // set active comp first
		});
	}

	function loadCompositions(data) {
		for (const k in data) {
			for (let i = 0; i < data[k].tracks.length; i++) {
				const track = data[k].tracks[i];
				for (let j = 0; j < track.clips.length; j++) {
					const clip = track.clips[j];
					data[k].tracks[i].clips[j].animation = app.footage.get(clip.name);
				}
			}
		}
		app.compositions.load(data);
	}

	this.save = function() {
		const json = { v: '0.1' };
		json.activeComposition = app.timeline.activeComposition;
		json.footage = app.footage.filePaths;
		json.compositions = app.compositions.data;
		console.log(app.compositions.data);
		const jsonFile = JSON.stringify(json);
		const blob = new Blob([jsonFile], { type: "application/x-download;charset=utf-8" });
		saveAs(blob, projectName + '.json');
	};

	this.load = function(fileName, callback) {
		self.projectName = fileName.split('/').pop().replace('.json', '');
		fetch(fileName)
			.then(response => { return response.json(); }) 
			.then(data => { loadData(data, callback); })
			.catch(err => { console.error('err', err.message ); });
	};

	this.open = function(data, fileName, filePath) {
		self.projectName = fileName.split('/').pop().replace('.json', '');
		loadData(data);
		window.history.pushState(fileName, fileName, location.href + '?src=' + filePath);
	};
}