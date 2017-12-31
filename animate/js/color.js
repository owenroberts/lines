/* uses id, title, callback, to support canvas bkg color */
function Color(id, title, callback) {
	const self = this;

	/* interface elements */
	this.color = "000000"; // this.htmlColor.value;
	this.colors = []; // all the colors used

	/* using hsl ranges */
	this.updateColor = function() {
		const h = self.hue.getValue();
		const s = self.sat.getValue();
		const l = self.light.getValue();
		let newColor = "hsl(" + h + "," + s + "%," + l + "%)";
		self.color = Cool.hslToHex(newColor);
		self.htmlColor.setValue(self.color);
		self.colorPreview.setColor(self.color);
		const bkgGrad = "linear-gradient(to right, hsl(0,"+s+"%,"+l+"%),hsl(60,"+s+"%,"+l+"%), hsl(120,"+s+"%,"+l+"%), hsl(180,"+s+"%,"+l+"%), hsl(240,"+s+"%,"+l+"%),hsl(300,"+s+"%,"+l+"%) 100%)";
		self.colorGradient.setBkg(bkgGrad);
	};

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

	this.setColor = function(hex) {
		self.color = hex;
		self.htmlColor.setValue(hex);
		self.colorPreview.setColor(self.color);
		self.updatePckrs();
	};

	/* interfaces */
	const panel = new Panel(id, title);
	Lines.interface.panels[id] = panel;

	this.colorPreview = new UIColor({
		color: this.color,
	});
	panel.add(this.colorPreview);

	panel.addRow();
	this.colorGradient = new UIColor({
		color: this.color
	})
	panel.add(this.colorGradient);

	panel.addRow();
	this.hue = new UIRange({
		label: "Hue",
		min: 0,
		max: 360,
		value: 0,
		callback: this.updateColor
	})
	panel.add(this.hue);

	panel.addRow();
	this.sat = new UIRange({
		label: "Sat",
		min: 0,
		max: 100,
		value: 0,
		callback: this.updateColor
	})
	panel.add(this.sat);

	panel.addRow();
	this.light = new UIRange({
		label: "Light",
		min: 0,
		max: 100,
		value: 0,
		callback: this.updateColor
	})
	panel.add(this.light);

	panel.addRow();
	this.htmlColor = new UIText({
		label: "HTML",
		value: this.color,
		callback: function(ev) {
			if (ev.which == 13) self.setColor(this.value);
		}
	});
	panel.add(this.htmlColor);

	panel.addRow();
	this.colorWays = new UI({id:id + "-colorways"});
	panel.add(this.colorWays);
}