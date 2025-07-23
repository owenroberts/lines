/*
	load and serve sounds
	not part of regular game load because silent is typically an option, so don't want to load sounds until necessary

	key and url don't have to match, but key and sequence url do

	sfx = SoundProvider({
		audioFiles: [
			{ key, url }
			{ key, sequence } ... key is base url for sequence, url_index.wav
		],
		baseUrl: './sfx' // default
	}, soundFiles => {
	
	})
*/

import { random } from '../../../cool/cool.js';

export class AudioPlayer {

	constructor(params={}, callback) {
	
		this.sounds = {};
		this.baseUrl = params.baseUrl ?? './sfx/';
		this.files = params.files ?? [];
	}

	load(files, callback) {

		let fileCount = 0;
		let loaded = 0;

		function loadedCallback() {
			loaded++;
		}

		for (let i = 0; i < files.length; i++) {
			const { key, url, sequence, volume } = files[i];
			if (sequence) {
				this.sounds[key] = [];
				const [s, e] = sequence;
				for (let k = s; k <= e; k++) {
					fileCount++;
					this.preloadAudio(key, `${this.baseUrl}${key}_${k}.wav`, true, volume, loadedCallback);
				}
			} else {
				fileCount++;
				this.preloadAudio(key, `${this.baseUrl}${url}`, false, volume, loadedCallback);
			}
		}

		const loader = setInterval(() => {
			if (loaded === fileCount) {
				clearInterval(loader);
				if (callback) callback(this.sounds);
			}
		}, 1000 / 30);
	}

	preloadAudio(key, url, isSequence, volume=1, callback) {
		var audio = new Audio();
		audio.addEventListener('canplaythrough', callback, false);
		audio.src = url;
		audio.volume = volume;
		audio.load();
		if (isSequence) this.sounds[key].push(audio);
		else this.sounds[key] = audio;
	}

	isSoundLoaded(key) {
		if (!this.sounds[key]) {
			console.warn(`Sound ${key} is not loaded`, this.sounds);
			return false;
		} else {
			return true;
		}
	}

	play(key, { randomRate=false, rateMin=0.9, rateMax=1.1, callback }={}) {
		if (!this.isSoundLoaded(key)) return;

		const s = Array.isArray(this.sounds[key]) ? 
			random(this.sounds[key]) : 
			this.sounds[key];
		// if (!s.paused) stop(key); // default functionality? -- breaks web play back, need params or defaults ... 
		if (randomRate) s.playbackRate = random(rateMin, rateMax);
		if (callback) s.addEventListener('ended', callback);
		s.play();
	}

	// the way this works is weird ... okay elaborate on that ...
	loop(key, { randomRate=false, rateMin=0.9, rateMax=1.1 }={}) {
		if (!this.isSoundLoaded(key)) return;

		if (Array.isArray(this.sounds[key]) && 
			this.sounds[key].every(s => s.paused)) {
			this.play(key, randomRate, rateMin, rateMax);
		} else {
			if (this.sounds[key].paused) {
				this.play(key, randomRate, rateMin, rateMax);
			}
		}
	}

	pause(key) {
		if (!this.isSoundLoaded(key)) return;

		if (Array.isArray(this.sounds[key])) {
			this.sounds[key]
				.filter(a => !a.paused)
				.forEach(a => { a.pause(); });
		} else {
			this.sounds[key].pause();
		}
	}

	stop(key) {
		if (!this.isSoundLoaded(key)) return;

		if (Array.isArray(sounds[key])) {
			sounds[key]
				.filter(a => !a.paused)
				.forEach(a => { 
					a.pause();
					a.currentTime = 0; 
				});
		} else {
			sounds[key].pause();
			sounds[key].currentTime = 0;
		}
	}

}