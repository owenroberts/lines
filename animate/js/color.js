function Color(id, title, callback) {
	const self = this;

	/* interface elements */
	this.color = "000000"; // this.htmlColor.value;
	this.colors = []; // all the colors used

	this.updateColor = function() {
		const h = self.hue.getValue();
		const s = self.sat.getValue();
		const l = self.light.getValue();
		let newColor = "hsl(" + h + "," + s + "%," + l + "%)";
		self.color = hslToHex(newColor);
		if (callback) callback(self.color);
		self.htmlColor.value = self.color;
		self.colorPreview.setColor(self.color);
		const bkgGrad = "linear-gradient(to right, hsl(0,"+s+"%,"+l+"%),hsl(60,"+s+"%,"+l+"%), hsl(120,"+s+"%,"+l+"%), hsl(180,"+s+"%,"+l+"%), hsl(240,"+s+"%,"+l+"%),hsl(300,"+s+"%,"+l+"%) 100%)";
		self.colorGradient.setBkg(bkgGrad);
	};

	this.updatePckrs = function() {
		let hsl = rgbToHsl(hexToRgb(self.color));
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
			colorBtn.innerHTML =  newColor;
			colorBtn.style.background = "#" + newColor;
			colorBtn.onclick = function() {
				self.color = this.innerHTML;
				self.colorPreview.setColor(self.color);
				self.updatePckrs();
			}
			this.colorWays.append(colorBtn);
		}
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
		title: "HTML",
		value: this.color,
		callback: function(ev) {
			if (ev.which == 13) {
				self.color = this.value;
				if (callback) callback(self.color);
				self.colorPreview.setColor(self.color);
				self.updatePckrs();
			}
		}
	});
	panel.add(this.htmlColor);

	panel.addRow();
	this.colorWays = new UI({id:id + "-colorways"});
	panel.add(this.colorWays);
}