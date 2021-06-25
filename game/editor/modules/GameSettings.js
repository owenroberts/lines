function GameSettings(editor, suspend) {
	
	this.toggleSuspend = function() {
		GAME.editorSuspend = true;
		GAME.suspend = !GAME.suspend;
	};

	if (suspend) this.toggleSuspend();

	this.setScene = function(sceneName) {
		GAME.scene = sceneName;
		editor.ui.reset();
	};

	this.loadAnimations = function() {

		const modal = new UIModal("Load Animations", editor, { x: 120, y: 40});

		for (const type in GAME.sprites) {
			
			modal.add(new UILabel({
				text: type,
			}));
			modal.addBreak();

			for (const label in GAME.sprites[type]) {

				const sprite = GAME.sprites[type][label];
				
				modal.add(new UIToggle({
					onText: label,
					offText: label,
					isOn: !sprite.isLoaded,
					callback: () => {
						if (sprite.isLoaded) {
							sprite.isLoaded = false;
							return;
						}
						editor.loadAnimation(type, label, sprite.src);
					}
				}))

			}

			modal.addBreak();
		}

	};
}