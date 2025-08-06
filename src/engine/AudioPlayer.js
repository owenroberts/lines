import { random } from '../../../cool/cool.js';

/**
 * provide audio player, access with gm.sfx
 * play sounds with gm.sfx.play(key, options)
 * playing sounds that don't exist does not error (so silent option game doesn't need extra code, or error)
 * if some sounds are loaded, and sounds don't exist, logs warning
 * silent if no sounds are ever loaded
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

		this.loaded = 0;
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

		function loadedCallback() {
			this.loaded++;
		}

		for (let i = 0; i < files.length; i++) {
			const { key, url, sequence, volume } = files[i];
			if (sequence) {
				this.sounds[key] = [];
				const [s, e] = sequence;
				for (let k = s; k <= e; k++) {
					fileCount++;
					this.preloadAudio(key, `${this.baseUrl}${key}_${k}.wav`, true, volume);
				}
			} else {
				fileCount++;
				this.preloadAudio(key, `${this.baseUrl}${url}`, false, volume);
			}
		}

		const loader = setInterval(() => {
			if (this.loaded === fileCount) {
				clearInterval(loader);
				if (callback) callback(this.sounds);
			}
		}, 1000 / 30);
	}

	preloadAudio(key, url, isSequence, volume=1, callback) {
		var audio = new Audio();
		audio.addEventListener('canplaythrough', () => {
			this.loaded++;
		}, false);
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
			if (this.loaded > 0) {
				console.warn(`Sound ${key} is not loaded`, this.sounds);
			}
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
	 * @param {boolean} isStop - reset time to 0             
	 */
	pause(key, isStop=false) {
		if (!this.isSoundLoaded(key)) return;

		if (Array.isArray(this.sounds[key])) {
			this.sounds[key]
				.filter(a => !a.paused)
				.forEach(a => { 
					a.pause();
					if (isStop) a.currentTime = 0;
				});
		} else {
			this.sounds[key].pause();
			if (isStop) this.sounds[key].currentTime = 0;
		}
	}

	/**
	 * stop sound by key - restarts from time 0
	 * @param  {string}    key                
	 */
	stop(key) {
		this.pause(key, true);
	}
}