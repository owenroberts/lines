/* global Lines object */
window.addEventListener("load", function() {
	Lines = {};

	// global parts used everywhere
	Lines.frames = [];
	Lines.lines = []; // lines currently being drawn
	Lines.drawings = []; // saved drawings
	Lines.currentFrame = 0;
	
	Lines.interface = new Interface();
	Lines.canvas = new Canvas(1024, 768, "000000"); // width height color, def color is 000000/black
	Lines.draw = new Draw();
	Lines.data = new Data();
	Lines.color = new Color("color", "Line Color"); 
	Lines.color.setColor("ffffff");
	Lines.drawEvents = new DrawEvents();
	Lines.fio = new Files_IO();
	Lines.draw.start();
});
