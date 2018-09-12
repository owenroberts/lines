const Events = {
	init: function(canvas) {

		var startX, startY, endX, endY, startTime;
		var dragStarted = false;
		var dragOffset;

		canvas.addEventListener('click', function(ev) {
			ev.preventDefault();
			if (typeof mouseClicked === "function") 
				mouseClicked(ev.offsetX, ev.offsetY);
		}, false);

		canvas.addEventListener('mousedown', function(ev) {
			ev.preventDefault();
			if (typeof mouseDown === "function") 
				mouseDown(ev.offsetX, ev.offsetY, ev.which);
			if (typeof startDrag === "function") {
				dragOffset = startDrag(ev.offsetX, ev.offsetY);
				if (dragOffset) 
					dragStarted = true;
			}
		}, false);

		canvas.addEventListener('mouseup', function(ev) {
			ev.preventDefault();
			if (typeof mouseUp === "function") 
				mouseUp(ev.offsetX, ev.offsetY, ev.which);
			if (dragStarted)
				dragStarted = false;
		}, false);

		canvas.addEventListener('mousemove', function(ev) {
			if (typeof mouseMoved === "function") 
				mouseMoved(ev.offsetX, ev.offsetY, ev.which);
			if (dragStarted) 
				drag(ev.offsetX, ev.offsetY, dragOffset);
		}, false);

		document.addEventListener('keydown', function(ev) {
			if (typeof keyDown === "function" && ev.target.tagName != "INPUT") 
				keyDown(Cool.keys[ev.which]);
		});

		document.addEventListener('keyup', function(ev) {
			if (typeof keyUp === "function" && ev.target.tagName != "INPUT") 
				keyUp(Cool.keys[ev.which]);
		});

		document.addEventListener('resize', function(ev) {
			if (typeof sizeCanvas === "function") 
				sizeCanvas();
		}, false);
	}
}