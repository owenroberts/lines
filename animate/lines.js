/* global Lines object */
window.addEventListener("load", function() {
	Lines = {};
	// global parts used everywhere
	Lines.frames = [];
	Lines.lines = []; // lines currently being drawn
	Lines.drawings = []; // saved drawings
	Lines.currentFrame = 0;
	
	// modules 
	Lines.interface = new Interface();
	// width height color, def color is black 000000
	Lines.canvas = new Canvas(1024, 768 /*, "000000"*/); 
	Lines.draw = new Draw();
	Lines.data = new Data();
	Lines.color = new Color("color", "Line Color"); 
	/*Lines.color.setColor("ffffff");*/
	Lines.drawEvents = new DrawEvents();
	Lines.fio = new Files_IO();
	
	// start, for some reason
	Lines.draw.start();
});
