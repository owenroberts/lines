import { Manager } from './Manager.js';

export class SceneManager extends Manager {

	// this seems nuts, why is the scene manager addings sprites to scenes??
	add(item, scenes, which) {
		// default values?
		if (typeof scenes == 'string') scenes = [scenes];
		for (let i = 0; i < scenes.length; i++) {
			if (which == 'display') this[scenes[i]].addToDisplay(item);
			else if (which == 'ui') this[scenes[i]].addUI(item)
			else this[scenes[i]].addSprite(item);
		}
	}

	addToDisplay(item, scenes) {
		this.add(item, scenes, 'display')
	}

	addUI(item, scenes) {
		this.add(item, scenes, 'ui');
	}

	isCurrent(sceneName) {
		return this.currentName === sceneName;
	}

	addScene(scene, key) {
		this[key] = scene;
		this.names.push(key);
	}
}