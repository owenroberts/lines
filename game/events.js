var Events = {
	init: function(canvas) {
		var startX, startY, endX, endY, startTime;
		var dragStarted = false;
		var dragOffset;

		canvas.addEventListener('mousedown', function(ev) {
			ev.preventDefault();
			if (typeof startDrag === "function") {
				dragOffset = startDrag(ev.offsetX, ev.offsetY);
				if (dragOffset) 
					dragStarted = true;
			}
		}, false);

		canvas.addEventListener('mousemove', function(ev) {
			ev.preventDefault();
			if (dragStarted) 
				drag(ev.offsetX, ev.offsetY, dragOffset);
		}, false);

		canvas.addEventListener('mouseup', function(ev) {
			ev.preventDefault();
			dragStarted = false;
		}, false);
	}
}