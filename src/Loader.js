/*
	load and serve sprites
*/

function Loader(params) {

	let debug = params.debug || false;
	let relativeLoadPath = params.relativeLoadPath;
	let saveAnimationData = params.saveAnimationData || false;
	let assets = {};
	let loadCallback;

	function loadAnimation(fileName, key, src) {
		if (relativeLoadPath) src = '.' + src;
		fetch(src)
			.then(response => { return response.json() })
			.then(json => {
				assets[fileName][key].json = json;
				// assets[fileName][key].animation = new GameAnim();
				assets[fileName][key].src = src; // need this?
				assets[fileName][key].isLoaded = true;
				checkLoader();
				// assets[fileName][key].animation.loadData(json, () => {
				// });
			});
	}

	function checkLoader() {

		let isLoaded = true;
		for (const file in assets) {
			for (const key in assets[file]) {
				if (!assets[file][key].isLoaded) isLoaded = false;
			}
		}

		if (isLoaded) {
			loadCallback(assets);
			loadCallback = undefined;
		}
	}

	function handleResponse(response) {
		if (response.ok) {
			return response.url.includes('csv') ?
				response.text() :
				response.json();
		}
		throw new Error('Network response error');
	}

	function handleData(fileName, data, loadDataOnly) {
		if (typeof data === 'object') {
			assets[fileName] = {};
			for (const key in data) {
				assets[fileName][key] = {};
				assets[fileName][key].data = data[key];
				assets[fileName][key].isLoaded = loadDataOnly ? true : false;
				loadAnimation(fileName, key, data[key].src);
			}
		} else {
			const csv = CSVToArray(data, ',').splice(0);
			const keys = csv[0];
			assets[fileName] = { items: [] };
			for (let i = 1; i < csv.length; i++) {
				const itemData = { isLoaded: false };
				for (let j = 0; j < keys.length; j++) {
					itemData[keys[j]] = csv[i][j];
				}
				assets[fileName].items.push(itemData);
				loadAnimation(fileName, itemData.label, `drawings/${fileName}/${itemData.label}.json`);
			}
		}
	}

	function handleError(error, fileName) {
		console.error('file load error', error);
		console.log(data,fileName);
		assets[fileName].loaded = true; // need this?
	}

	function load(files, loadDataOnly, callback) {
		if (debug) console.log('loading data');
		if (debug) console.time('load data');
		loadCallback = callback;
		for (const fileName in files) {
			const file = files[fileName];
			assets[fileName] = { loaded: false };
			fetch(file)
				.then(response => { return handleResponse(response); })
				.then(data => { handleData(fileName, data, loadDataOnly); })
				.catch(error => { handleError(error, fileName); }); 
		}
	}

	function getAnimation(fileName, key) {
		return assets[fileName][key].animation;
	}

	function getAnimationData(fileName, key) {
		return assets[fileName][key];
	}

	function getFile(fileName) {
		return assets[fileName];
	}

	return { load, getAnimation, getAnimationData, getFile };

}

window.Lines.Loader = Loader;