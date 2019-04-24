/* uses id, title, callback, to support canvas bkg color */
function Color(callback) {
	const self = this;

	/* interface elements */
	this.color = "#000000"; // this.htmlColor.value;
	this.colors = []; // all the colors used // is this more of an interface thing?

	/* set current color */
	this.set = function(color) {
		self.color = color;
		if (callback) callback(color);
	};

	/* add new color button only used by lines 
		move to interface? */
	this.addColorBtn = function(color) {
		if (!self.colors.includes(color)) {
			self.colors.push(color);

			const btn = new UIButton({
				title: color,
				css: { "background": color },
				value: color,
				callback: self.set
			});
			Lines.interface.panels['line-color'].add(btn);
		}
	};
}