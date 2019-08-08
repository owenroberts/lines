/* uses id, title, callback, to support canvas bkg color */
function Color(callback) {
	const self = this;

	this.color = "#000000"; // this.htmlColor.value;

	/* set current color */
	this.set = function(color) {
		// console.log(self);
		// console.log(color);
		self.color = color;
		if (callback) callback(color);
	};

	// this is a stupid module, but where should this function go?
}