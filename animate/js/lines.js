/* global Lines object */
window.addEventListener("load", function() {
	/* maybe lines is just app */
	Lines = {};
	Lines.canvas = new Canvas();
	Lines.color = new Color();
	
	Lines.data = new Data(Lines);
	Lines.interface = new Interface(Lines);
	Lines.draw = new Draw(Lines); /* could just ref Lines of this.app = Lines */
	Lines.keyboard = new Keyboard(Lines);
	Lines.mouse = new Mouse(Lines);
	Lines.draw.start();
});
