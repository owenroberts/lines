/* uses id, title, callback, to support canvas bkg color */
function Color(id, title, callback) {
	const self = this;

	/* interface elements */
	this.color = "000000"; // this.htmlColor.value;
	this.colors = []; // all the colors used // is this more of an interface thing?

	/* using hsl ranges */
	this.updateColor = function() {
		const h = self.hue.getValue();
		const s = self.sat.getValue();
		const l = self.light.getValue();
		let newColor = "hsl(" + h + "," + s + "%," + l + "%)";
		self.color = Cool.hslToHex(newColor);
		if (callback) 
			callback(self.color); // for canvas
		self.htmlColor.setValue(self.color);
		self.colorPreview.setColor(self.color);
		const bkgGrad = "linear-gradient(to right, hsl(0,"+s+"%,"+l+"%),hsl(60,"+s+"%,"+l+"%), hsl(120,"+s+"%,"+l+"%), hsl(180,"+s+"%,"+l+"%), hsl(240,"+s+"%,"+l+"%),hsl(300,"+s+"%,"+l+"%) 100%)";
		self.colorGradient.setBkg(bkgGrad);
	};

	/* update color interface values */
	this.updatePckrs = function() {
		let hsl = Cool.rgbToHsl(Cool.hexToRgb(self.color));
		self.hue.setValue(hsl[0]);
		self.sat.setValue(hsl[1]);
		self.light.setValue(hsl[2]);
		const s = self.sat.getValue();
		const l = self.sat.getValue();
		const bkgGrad = "linear-gradient(to right, hsl(0,"+s+"%,"+l+"%),hsl(60,"+s+"%,"+l+"%), hsl(120,"+s+"%,"+l+"%), hsl(180,"+s+"%,"+l+"%), hsl(240,"+s+"%,"+l+"%),hsl(300,"+s+"%,"+l+"%) 100%)";
		self.colorGradient.setBkg(bkgGrad);
	};

	/* add new color button only used by lines */
	this.addColorBtn = function(newColor) {
		if (self.colors.indexOf(newColor) == -1) {
			self.colors.push(newColor);
			const colorBtn = document.createElement('button');
			colorBtn.innerHTML = newColor;
			colorBtn.style.background = "#" + newColor;
			colorBtn.onclick = function() {
				self.color = this.innerHTML;
				self.colorPreview.setColor(self.color);
				self.updatePckrs();
			}
			this.colorWays.append(colorBtn);
		}
	};

	/* set current color */
	this.setColor = function(hex) {
		self.color = hex;
		self.htmlColor.setValue(hex);
		self.colorPreview.setColor(self.color);
		self.updatePckrs();
		if (callback) 
			callback(self.color); // for canvas
	};

	/* interfaces */
	const panel = new Panel(id + "-menu", title);

	this.colorPreview = new UIColor({
		color: this.color,
	});
	panel.add(this.colorPreview);

	this.colorGradient = new UIColor({
		color: this.color
	});
	panel.add(this.colorGradient);

	this.hue = new UIRange({
		label: "Hue",
		display: id + "-hue",
		min: 0,
		max: 360,
		value: 0,
		callback: this.updateColor
	});
	panel.add(this.hue);

	this.sat = new UIRange({
		label: "Sat",
		display: id + "-saturation",
		min: 0,
		max: 100,
		value: 0,
		callback: this.updateColor
	});
	panel.add(this.sat);

	this.light = new UIRange({
		label: "Light",
		display: id + "-lightness",
		min: 0,
		max: 100,
		value: 0,
		callback: this.updateColor
	});
	panel.add(this.light);

	this.htmlColor = new UIText({
		label: "HTML",
		value: this.color,
		callback: function(ev) {
			if (ev.which == 13) 
				self.setColor(this.value);
		}
	});
	panel.add(this.htmlColor);

	this.colorWays = new UI({id:id + "-colorways"});
	panel.add(this.colorWays);
}