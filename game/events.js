/* click  events */
canvas.addEventListener('click', function(ev) {
	ev.preventDefault();
	if (typeof mouseClicked === "function") mouseClicked(ev.offsetX, ev.offsetY);
}, false);

canvas.addEventListener('mousemove', function(ev) {
	if (typeof mouseMoved === "function") mouseMoved(ev.offsetX, ev.offsetY);
}, false);