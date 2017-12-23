/* global Lines object */
window.addEventListener("load", function() {
	/* maybe lines is just app */
	Lines = {};
	Lines.interface = new Interface();
	Lines.canvas = new Canvas(512, 512); // color is third argument in hex
	Lines.draw = new Draw(); /* could just ref Lines of this.app = Lines */
	Lines.data = new Data();
	Lines.color = new Color("color", "Line Color"); // set Lines.color.color to hex for different starting color
	Lines.mouse = new Mouse();
	Lines.draw.start();
});
