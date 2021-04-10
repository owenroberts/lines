function GameSettings(editor) {
	
	this.toggleSuspend = function() {
		GAME.editorSuspend = true;
		GAME.suspend = !GAME.suspend;
	};

	this.setScene = function(sceneName) {
		GAME.scene = sceneName;
		editor.ui.reset();
	};
}