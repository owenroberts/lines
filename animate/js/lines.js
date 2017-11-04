/* global Lines object */
let lines;
function Lines() {
	/*  save states never really implemented 
	no longer the case !! */
	this.canvas = new Canvas();
	this.color = new Color();
	this.draw = new Draw(this);
	this.data = new Data(this);
	this.interface = new Interface(this);
	this.keyboard = new Keyboard(this);
	this.mouse = new Mouse(this);
	this.draw.start();
}
window.addEventListener("load", function() {
	/* maybe lines is just app */
	lines = new Lines();
});
