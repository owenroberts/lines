/* global Lines object */
window.addEventListener("load", function() {
	Lines = {};
	Lines.interface = new Interface();
	Lines.canvas = new Canvas(512, 512, "ffffff"); // width height color, def color is 000000/black
	Lines.draw = new Draw();
	Lines.data = new Data();
	Lines.color = new Color("color", "Line Color"); 
	// Lines.color.setColor("ff00ff");
	Lines.mouse = new Mouse();
	Lines.fio = new Files_IO();
	Lines.draw.start();
});
