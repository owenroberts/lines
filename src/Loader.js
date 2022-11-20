/*
	load and serve sprites
*/

function Loader(params) {

	let relativeLoadPath = params.relativeLoadPath;
	let debug = params.debug || false;
	let data = {
		animations: {},
	};
	// let totalFiles = 0;
	let assetsLoaded = {};

	function handleResponse(response) {
		if (response.ok) {
			return response.url.include('csv') ?
				response.text() :
				response.json();
		}
		throw new Error('Network response error');
	}

	function handleData(data) {

	}

	function handleError(error, fileName) {
		console.log('file load error', error);
		assetsLoaded[fileName] = true; // need this?
	}

	function load(files, loadEntriesOnly, callback) {
		if (debug) console.log('loading data');
		if (debug) console.time('load data');

		let fileCount = 0;
		let totalFiles = Object.keys(files).length;

		for (const fileName in files) {
			const file = files[fileName];
			fetch(file)
				.then(response => handleResponse)
				.then(data => handleData)
				.catch(error => { handleError(error, fileName); }); 
		}


	}

	return { load };

}

window.Lines.Loader = Loader;