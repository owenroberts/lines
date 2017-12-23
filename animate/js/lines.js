/* global Lines object */
window.addEventListener("load", function() {
	/* maybe lines is just app */
	Lines = {};
	Lines.interface = new Interface(Lines);
	Lines.canvas = new Canvas();
	Lines.draw = new Draw(Lines); /* could just ref Lines of this.app = Lines */
	Lines.data = new Data(Lines);
	Lines.color = new Color();
	Lines.mouse = new Mouse(Lines);
	Lines.draw.start();
});
