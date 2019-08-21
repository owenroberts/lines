class ItemEditUI extends EditUI {
	constructor(item, panel) {
		super(item, panel);
	}

	create() {

		this.uis.x = new UIText({
			label: "x",
			value: this.item.position.x,
			callback: function(value) {
				this.item.position.x = +value;
			}
		});

		this.uis.y = new UIText({
			label: "y",
			value: this.item.position.y,
			callback: function(value) {
				this.item.position.y = +value;
			}
		});

		this.uis.addScene = new UIButton({
			title: "+ scene",
			callback: function() {
				const s = addSceneSelector(Game.scenes[0], this.item.scenes.length);
				this.panel.add(s, this.row);
			}
		});


		this.uis.sceneSelectors = [];
		for (let i = 0; i < this.item.scenes.length; i++) {
			this.uis.sceneSelectors[i] = new UISelect({
				options: Game.scenes,
				selected: this.item.scenes[i],
				callback: function(value) {
					this.item.scenes[i] = value;
				}
			});
		}

		super.create(); /* bc super calls ui.add */
	}
}