function Color() {
	const self = this;

	/* interface elements */
	this.htmlColor = document.getElementById("html-color");
	this.colorPreview = document.getElementById("color");
	this.colorGradient = document.getElementById("color-gradient");
	this.hue = document.getElementById("hue");
	this.sat = document.getElementById("saturation");
	this.light = document.getElementById("lightness");
	this.pckrs = document.getElementsByClassName("pckr");

	this.color = this.htmlColor.value;
	this.colors = []; // all the colors used

	this.colorPreview.style.backgroundColor = "#" + this.color;
	this.colorGradient.style.backgroundColor = "#" + this.color;

	this.updateColor = function() {
		let newColor = "hsl(" + self.hue.value + "," + self.sat.value + "%," + self.light.value + "%)";
		self.color = hslToHex(newColor);
		self.htmlColor.value = self.color;
		self.colorPreview.style.backgroundColor = "#" + self.color;
		self.colorGradient.style.backgroundImage = "linear-gradient(to right, hsl(0,"+self.sat.value+"%,"+self.light.value+"%),hsl(60,"+self.sat.value+"%,"+self.light.value+"%), hsl(120,"+self.sat.value+"%,"+self.light.value+"%), hsl(180,"+self.sat.value+"%,"+self.light.value+"%), hsl(240,"+self.sat.value+"%,"+self.light.value+"%),hsl(300,"+self.sat.value+"%,"+self.light.value+"%) 100%)";
	};
	//this.updateColor();

	for (let i = 0; i < this.pckrs.length; i++) {
		this.pckrs[i].addEventListener("input", this.updateColor);
	}

	this.updatePckrs = function() {
		let hsl = rgbToHsl(hexToRgb(self.color));
		self.hue.value = hsl[0];
		self.sat.value = hsl[1];
		self.light.value = hsl[2];
		self.colorGradient.style.backgroundImage = "linear-gradient(to right, hsl(0,"+self.sat.value+"%,"+self.light.value+"%),hsl(60,"+self.sat.value+"%,"+self.light.value+"%), hsl(120,"+self.sat.value+"%,"+self.light.value+"%), hsl(180,"+self.sat.value+"%,"+self.light.value+"%), hsl(240,"+self.sat.value+"%,"+self.light.value+"%),hsl(300,"+self.sat.value+"%,"+self.light.value+"%) 100%)";
	};

	this.htmlColor.addEventListener("keyup", function(ev) {
		if (ev.which == 13) {
			self.color = this.value;
			self.colorPreview.style.backgroundColor = "#" + self.color;
			self.updatePckrs();
		}
	});

	this.addColorBtn = function(newColor) {
		if (self.colors.indexOf(newColor) == -1) {
			self.colors.push(newColor);
			const colorBtn = document.createElement('button');
			colorBtn.innerHTML =  newColor;
			colorBtn.style.background = "#" + newColor;
			colorBtn.onclick = function() {
				self.color = this.innerHTML;
				self.colorPreview.style.backgroundColor = "#" + self.color;
				self.updatePckrs();
			}
			document.getElementById('colorways').appendChild( colorBtn );
		}
	};
}