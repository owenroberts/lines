/*
	load and serve sounds
	not part of regular game load because silent is typically an option, so don't want to load sounds until necessary

	key and url don't have to match, but key and sequence url do

	sfx = SoundProvider({
		audioFiles: [
			{ key, url }
			{ key, sequence } ... key is base url for sequence, url_index.wav
		]	
	}, soundFiles => {
	
	})
*/

const { random } = Cool;

function SoundProvider(params, callback) {
	const sounds = {};
	const baseUrl = params.baseUrl ?? './public/sfx/';
	const audioFiles = params.audioFiles ?? []; // blank sound provider just does nothing

	let fileCount = 0;
	let loaded = 0;

	for (let i = 0; i < audioFiles.length; i++) {
		const { key, url, sequence } = audioFiles[i];
		if (sequence) {
			sounds[key] = [];
			const [s, e] = sequence;
			for (let k = s; k <= e; k++) {
				fileCount++;
				preloadAudio(key, `${baseUrl}${key}_${k}.wav`, true);
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

	function preloadAudio(key, url, isSequence) {
		var audio = new Audio();
		audio.addEventListener('canplaythrough', loadedAudio, false);
		audio.src = url;
		audio.load();
		if (isSequence) sounds[key].push(audio);
		else sounds[key] = audio;
	}
	
	function loadedAudio() {
		loaded++;
	}

	function play(key, randomRate, rateMin, rateMax) {
		if (!sounds[key]) return console.warn('No sound', key);
		const s = Array.isArray(sounds[key]) ? random(sounds[key]) : sounds[key];
		if (randomRate) s.playbackRate = random(rateMin ?? 0.9, rateMax ?? 1.1);
		s.play();
	}

	function keepPlaying(key, randomRate, rateMin, rateMax) {
		if (!sounds[key]) return console.warn('No sound', key);
		if (Array.isArray(sounds[key]) && sounds[key].every(s => s.paused)) {
			play(key, randomRate, rateMin, rateMax);
		} else {
			if (sounds[key].paused) play(key, randomRate, rateMin, rateMax);
		}
	}

	function pause(key) {
		if (!sounds[key]) return console.warn('No sound', key);
		if (Array.isArray(sounds[key])) {
			sounds[key]
				.filter(a => !a.paused)
				.forEach(a => { a.pause(); });
		} else {
			sounds[key].pause();
		}
	}

	function stop(key) {
		if (!sounds[key]) return console.warn('No sound', key);
		if (Array.isArray(sounds[key])) {
			sounds[key]
				.filter(a => !a.paused)
				.forEach(a => { a.stop(); });
		} else {
			sounds[key].pause();
		}
	}

	return { sounds, play, pause, stop, keepPlaying };

}

window.LinesEngine.SoundProvider = SoundProvider;