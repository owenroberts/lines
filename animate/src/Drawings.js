/*
	view all drawings and toggle on/off in frame
*/

function Drawings(lns) {

	let panel;

	function getLayer(drawingIndex) {
		// get layers containing drawing
		// this would be easier if layrs inside of drawing ...
		const layers = lns.anim.layers
			.filter((layer, index) => index < lns.anim.layers.length - 1 && layer.drawingIndex == drawingIndex);
		// console.log(drawingIndex, layers);

		if (layers.length > 0) {
			// get a layer in the current frame if it exists
			for (let i = 0; i < layers.length; i++) {
				if (layers[i].isInFrame(lns.anim.currentFrame)) {
					return layers[i];
				}
			}

			// or get adjacent layer
			for (let i = 0; i < layers.length; i++) {
				if (layers[i].isInFrame(lns.anim.currentFrame + 1) || 
					layers[i].isInFrame(lns.anim.currentFrame - 1)) {
					return layers[i];
				}
			}

			// or just return the first layer
			return layers[0];
		}
		// console.log(layers);
		return false;
	}

	function update() {
		panel.drawings.clear();
		// -1 to ignore draw drawing
		for (let i = 0; i < lns.anim.drawings.length - 1; i++) {
			if (lns.anim.drawings[i]) {
				// const drawing = lns.anim.drawings[i];
				let layer = getLayer(i); /* check for existing layer */

				panel.append(new UIToggle({
					text: i,
					isOn: layer ? layer.isInFrame(lns.anim.currentFrame) : false,
					callback: function(isOn) {
						let layer = getLayer(i);
						if (isOn) { /* add */
							if (layer) {
								if (layer.isInFrame(lns.anim.currentFrame) ||
									layer.isInFrame(lns.anim.currentFrame - 1) ||
									layer.isInFrame(lns.anim.currentFrame + 1)) {
									layer.addIndex(lns.anim.currentFrame);
								} else {
									const props = layer.getCloneProps();
									props.startFrame = props.endFrame = lns.anim.currentFrame;
									lns.anim.addLayer(new Layer(props));
								}
							} else {
								// get props
								lns.anim.addLayer(new Layer({
									drawingIndex: i,
									linesInterval: +lns.ui.faces.linesInterval.value,
									segmentNum: +lns.ui.faces.segmentNum.value,
									jiggleRange: +lns.ui.faces.jiggleRange.value,
									wiggleRange: +lns.ui.faces.wiggleRange.value,
									wiggleSpeed: +lns.ui.faces.wiggleSpeed.value,
									color: lns.ui.faces.color.value,
									startFrame: lns.anim.currentFrame,
								}));
							}
						} else { /* remove */
							if (layer) {
								if (layer.isInFrame(lns.anim.currentFrame)) {
									const newLayer = layer.removeIndex(lns.anim.currentFrame, () => {
										lns.anim.removeLayer(layer);
									});
									if (newLayer) lns.anim.addLayer(newLayer);
								} 
							} 
						}
						
						lns.ui.update();
					}
				}), i);
			}
		}
	}

	function connect() {
		panel = lns.ui.getPanel('drawings');
	}

	return { connect };
}