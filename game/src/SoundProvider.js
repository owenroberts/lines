/*
	load and serve sounds
	make loader class ....

	sfx = SoundProvider({
		audioFiles: [
			{ key, url }
			{ key, sequence } ... key is base url for sequence, url_index.wav
		]	
	}, soundFiles => {
	
	})
*/

function SoundProvider(params, callback) {
	const sounds = {};
	const baseUrl = params.baseUrl ?? './sfx/';
	const audioFiles = params.audioFiles;

	let fileCount = 0;
	let loaded = 0;

	for (let i = 0; i < audioFiles.length; i++) {
		const { key, url, sequence } = audioFiles[i];
		if (sequence) {
			const [s, e] = sequence;
			for (let k = s; k <= e; k++) {
				fileCount++;
				preloadAudio(`${key}_${k}`, `${baseUrl}${key}_${k}.wav`);
			}
		} else {
			fileCount++;
			preloadAudio(key, `${baseUrl}${url}`);
		}
	}

	const loader = setInterval(() => {
		if (loaded === fileCount) {
			clearInterval(loader);
			if (callback) callback(sounds);
		}
	}, 1000 / 30);

	function preloadAudio(key, url) {
		var audio = new Audio();
		audio.addEventListener('canplaythrough', loadedAudio, false);
		audio.src = url;
		audio.load();
		sounds[key] = audio;
	}
	
	function loadedAudio() {
		loaded++;
	}

	return { sounds };

}

window.LinesEngine.SoundProvider = SoundProvider;