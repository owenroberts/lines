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

	function loadData(data) {
		app.footage.load(data.footage, true, () => { 
			loadCompositions(data.compositions)
		});

	}

	function loadCompositions(compositions) {
		for (const k in compositions) {
			for (let i = 0; i < compositions[k].tracks.length; i++) {
				const track = compositions[k].tracks[i];
				for (let j = 0; j < track.clips.length; j++) {
					const clip = track.clips[j];
					compositions[k].tracks[i].clips[j].animation = app.footage.get(clip.name);
					
				}
			}
		}
		app.compositions.load(compositions);
	}

	this.save = function() {
		const json = { v: '0.1' };
		json.footage = app.footage.filePaths;
		json.compositions = app.compositions.data;
		const jsonFile = JSON.stringify(json);
		const blob = new Blob([jsonFile], { type: "application/x-download;charset=utf-8" });
		saveAs(blob, projectName + '.json');
	};

	this.load = function(fileName) {
		console.log(fileName)
		self.projectName = fileName.split('/').pop().replace('.json', '');
		fetch(fileName)
			.then(response => { return response.json(); }) 
			.then(data => { loadData(data); })
			.catch(err => { console.error('err', err.message ); });
	};
}