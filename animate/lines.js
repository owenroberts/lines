/* global Lines object */
function Lines() {
	/*  save states never really implemented  */

	this.canvas = new Canvas();
	this.drawingEvents = new DrawingEvents(this);
	this.color = new Color();
	this.background = new Background();
	this.draw = new Draw(this);
	this.data = new Data(this);
	this.interface = new Interface(this);
}
window.addEventListener("load", function() {
	/* maybe lines is just app */
	const lines = new Lines();
	console.log(lines);
});
