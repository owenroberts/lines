class EditorSprite extends Sprite {
	display(isMap) {
		if (this.isActive && (this.isOnScreen() || isMap)) {
			if (this.debug) this.drawDebug();
			if (this.animation && this.animation.loaded) {
				this.animation.draw(this.xy.x, this.xy.y);
				this.animation.update();
			}
		}
		if (this.displayFunc) this.displayFunc();
	}
}