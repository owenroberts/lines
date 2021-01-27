function GameSettings(editor) {
	
	this.toggleSuspend = function() {
		GAME.suspend = !GAME.suspend;
	};

	this.setScene = function(sceneName) {
		GAME.scene = sceneName;
		editor.ui.reset();
	};
}