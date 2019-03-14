/* global Lines object */
window.addEventListener("load", function() {
	
	Lines = {}; // L ? 

	// global parts used everywhere
	Lines.lines = []; // lines currently being drawn
	Lines.frames = [];
	Lines.drawings = []; // saved drawings
	Lines.currentFrame = 0;
	
	// modules 
	Lines.interface = new Interface();

	// width height color, def color is black 000000
	//  Lines.canvas = new Canvas(1024, 512, "ffffff" );  // sundays
	Lines.canvas = new Canvas(1024, 768, "ffffff" )
	Lines.draw = new Draw();
	Lines.data = new Data();
	Lines.lineColor = new Color("color", "Line Color");
	// Lines.lineColor.setColor('ffffff');
	Lines.drawEvents = new DrawEvents({ n: 2, r: 1, w: 1, v: 0.1 }); // defaults
	Lines.fio = new Files_IO({
		fit: false /* fit to canvas when saving */
	});

	// interfaces 
	Lines.drawingInterface = new DrawingInterface();
	
	Lines.draw.start(); // necessary ? 
});
