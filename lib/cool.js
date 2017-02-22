Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function HueToRgb(m1, m2, hue) {
    var v;
    if (hue < 0)
        hue += 1;
    else if (hue > 1)
        hue -= 1;

    if (6 * hue < 1)
        v = m1 + (m2 - m1) * hue * 6;
    else if (2 * hue < 1)
        v = m2;
    else if (3 * hue < 2)
        v = m1 + (m2 - m1) * (2/3 - hue) * 6;
    else
        v = m1;

    return 255 * v;
}

function hslToHex(c) {
  var hue=0, saturation=0, lightness=0;
  var tmp = 0;
  for (var i=0,j=0,k=0; i<c.length; i++) {
    var ch = c.charCodeAt(i);
    if (ch >= 48 && ch <= 57) {
      tmp = tmp * 10 + (ch-48);
      k = 1;
      continue;
    } else if (k === 1) {
      switch(j) {
        case 0: hue = (tmp % 360) / 360; break;
        case 1:
          saturation = (tmp > 100 ? 100 : tmp) / 100; break;
        case 2:
          lightness = (tmp > 100 ? 100 : tmp) / 100; break;
      }
      j++;
    }
    k = 0;
    tmp = 0;
  }
  var h = (hue / (1/6));
  var c = (1-Math.abs(2*lightness-1))*saturation;
  var x = c * (1-Math.abs((h%2)-1));
  switch (h | 0) {
    case 0: r=c; g=x; b=0; break;
    case 1: r=x; g=c; b=0; break;
    case 2: r=0; g=c; b=x; break;
    case 3: r=0; g=x; b=c; break;
    case 4: r=x; g=0; b=c; break;
    case 5: r=c; g=0; b=x; break;
  }
  var m = lightness - 0.5*c;
  r+=m; g+=m; b+=m;
  r=r*255|0; g=g*255|0; b=b*255|0;
  var hex = '';
      k = (r >> 4 & 0xf) + 48;
      if (k > 57) k += 7;
      hex += String.fromCharCode(k);
      k = (r & 0xf) + 48;
      if (k > 57) k += 7;
      hex += String.fromCharCode(k);
      k = (g >> 4 & 0xf) + 48;
      if (k > 57) k += 7;
      hex += String.fromCharCode(k);
      k = (g & 0xf) + 48;
      if (k > 57) k += 7;
      hex += String.fromCharCode(k);
      k = (b >> 4 & 0xf) + 48;
      if (k > 57) k += 7;
      hex += String.fromCharCode(k);
      k = (b & 0xf) + 48;
      if (k > 57) k += 7;
      hex += String.fromCharCode(k);
  return hex;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(rgb){
	rgb.r /= 255, rgb.g /= 255, rgb.b /= 255;
	var max = Math.max(rgb.r, rgb.g, rgb.b), min = Math.min(rgb.r, rgb.g, rgb.b);
	var h, s, l = (max + min) / 2;

	if (max == min) { h = s = 0; } 
	else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max){
			case rgb.r: h = (rgb.g - rgb.b) / d + (rgb.g < rgb.b ? 6 : 0); break;
			case rgb.g: h = (rgb.b - rgb.r) / d + 2; break;
			case rgb.b: h = (rgb.r - rgb.g) / d + 4; break;
		}
		
		h /= 6;
	}
	
	return [(h*100+0.5)|0, ((s*100+0.5)|0) + '%', ((l*100+0.5)|0) + '%'];
}

var keys = {
	"67":"c",
	"68":"d",
	"69":"e",
  "70":"f",
	"73":"i",
	"77":"m",
	"79":"o",
	"82":"r",
	"83":"s",
	"86":"v",
	"87":"w",
	"88":"x",
	"90":"z",
	"32":"space"
}

// vector stuff
function getDistance(a, b) {
	var xs = 0;
	var ys = 0;
	xs = b.x - a.x;
	xs = xs * xs;
	ys = b.y - a.y;
	ys = ys * ys;
	return Math.sqrt(xs + ys);
}

function Vector(x, y) {
	//this.x = a.x - b.x;
	//this.y = a.y - b.y;
  this.x = x;
  this.y = y;
	this.subtract = function(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
	};
	this.multiply = function(n) {
		this.x *= n;
		this.y *= n;
	};
	this.divide = function(n) {
		this.x /= n;
		this.y /= n;
	};
	this.magnitude = function() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	};
	
	this.normalize = function() {
		var m = this.magnitude();
		if (m != 0 && m != 1) this.divide(m);
	};
}