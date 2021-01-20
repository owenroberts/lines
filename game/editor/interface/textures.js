function Textures() {
	const self = this;

	this.display = function() {
		for (const key in GAME.anims.textures) {
			self.panel.add(new UIToggle({
				text: key,
				callback: function() {
					GAME.anims.textures[key].ui.toggle();
				}
			}));
		}	
	};
}