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
				assets.animations[fileName][key].json = json;
				assets.animations[fileName][key].src = src; // need this?
				assets.animations[fileName][key].isLoaded = true;
				checkLoader();
			});
	}

	function checkLoader() {

		let isLoaded = true;

		for (const type in assets) {
			for (const file in assets[type]) {
				if (type === 'animations') {
					for (const key in assets[type][file]) {
						if (!assets[type][file][key].isLoaded) isLoaded = false;
					}
				} else {
					if (!assets[type][file].isLoaded) isLoaded = false;					
				}
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

	function handleData(type, fileName, data, loadDataOnly) {
		if (type === 'animations') {
			assets[type] = {};
			if (typeof data === 'object') {
				assets[type][fileName] = {};
				for (const key in data) {
					assets[type][fileName][key] = {};
					assets[type][fileName][key].data = data[key];
					assets[type][fileName][key].isLoaded = loadDataOnly ? true : false;
					loadAnimation(fileName, key, data[key].src);
				}
			} else {
				const csv = CSVToArray(data, ',').splice(0);
				const keys = csv[0];
				assets[type][fileName] = { items: [] };
				for (let i = 1; i < csv.length; i++) {
					const itemData = { isLoaded: false };
					for (let j = 0; j < keys.length; j++) {
						itemData[keys[j]] = csv[i][j];
					}
					assets[type][fileName].items.push(itemData);
					loadAnimation(fileName, itemData.label, `drawings/${fileName}/${itemData.label}.json`);
				}
			}
		} else {
			assets[type][fileName] = data;
			assets[type][fileName].isLoaded = true;

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
		for (const type  in files) {
			assets[type] = {};
			for (const fileName in files[type]) {
				const file = files[type][fileName];
				assets[type][fileName] = { loaded: false };
				console.log(file);
				fetch(file)
					.then(response => { return handleResponse(response); })
					.then(data => { handleData(type, fileName, data, loadDataOnly); })
					.catch(error => { handleError(error, fileName); });
			}
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