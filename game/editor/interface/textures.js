function Textures() {
	const self = this;

	this.display = function() {
		for (const key in Game.sprites.textures) {
			self.panel.add(new UIToggle({
				text: key,
				callback: function() {
					Game.sprites.textures[key].ui.toggle();
				}
			}));
		}	
	};
}