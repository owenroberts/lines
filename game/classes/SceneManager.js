class SceneManager extends Manager {

	add(item, scenes, which) {
		if (typeof scenes == 'string') scenes = [scenes];
		for (let i = 0; i < scenes.length; i++) {
			if (which == 'display') this[scenes[i]].addToDisplay(item);
			else if (which == 'ui') this[scenes[i]].addUI(item)
			else this[scenes[i]].add(item);
		}
	}

}