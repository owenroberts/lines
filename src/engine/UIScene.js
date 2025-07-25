/**
 * scene with mouse events for ui
 */
export class UIScene extends Scene {
	mouseMoved(x, y) {
		this.uiSprites.all(sprite => {
			if (!sprite.over) console.log(sprite)
			sprite.over(x, y);
			sprite.out(x, y);
		});
	}

	mouseDown(x, y) {
		this.uiSprites.all(sprite => { sprite.down(x, y); });
	}

	mouseUp(x, y) {
		this.uiSprites.all(sprite => { sprite.up(x, y); });
	}
}