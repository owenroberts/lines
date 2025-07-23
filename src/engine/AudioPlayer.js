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

/**
 * provide audio player, access with gm.sfx
 */
export class AudioPlayer {

	/**
	 * creates audioplayer container, no sound files loaded 
	 * @param  {string} [options.baseUrl="./sfx/"] change baseUrl to load files from 
	 */
	constructor({ baseUrl="./sfx/" }={}) {
		this.sounds = {};
		this.files = [];
		this.baseUrl = baseUrl;
	}

	/**
	 * load audio files using
	 * single file: { key, url }
	 * sequence: { key, sequence [1, n] } - key must match file, adds _n.wav
	 * @param  {Array}   files    
	 * @param  {Function} callback - when all files loaded
	 */
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

	/**
	 * check if sound key exists, is loaded
	 * @param  {string}  key 
	 * @return {boolean}
	 */
	isSoundLoaded(key) {
		if (!this.sounds[key]) {
			console.warn(`Sound ${key} is not loaded`, this.sounds);
			return false;
		} else {
			return true;
		}
	}

	/**
	 * play sound by key
	 * @param  {string}    key                
	 * @param  {boolean}   [options.randomRate=false] - play sound at randomized playback rate
	 * @param  {number}    [options.rateMin=0.9]      - min value of random rate
	 * @param  {number}    [options.rateMax=1.1]      - max value of random rate
	 * @param  {Function}  [options.callback]         - callback after sound played
	 */
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

	/**
	 * loops sound by key, must be called in update fn
	 * @param  {string}    key                
	 * @param  {boolean}   [options.randomRate=false] - play sound at randomized playback rate
	 * @param  {number}    [options.rateMin=0.9]      - min value of random rate
	 * @param  {number}    [options.rateMax=1.1]      - max value of random rate
	 */
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

	/**
	 * pause sound by key - restarts from where it left off
	 * @param  {string}    key                
	 */
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

	/**
	 * stop sound by key - restarts from time 0
	 * @param  {string}    key                
	 */
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