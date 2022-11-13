/*
	play sequences based on states
*/

function Sequencer(app) {

	let panel, sequenceSelector, playToggle, frameDisplay, renderSequencer;

	let sequences = [];
	let sequenceIndex = 0;
	let isPlaying = false;
	let currentFrame = 0;
	let drawCount = 0;
	let isActive = false;
	let isCapturing = false;

	function addSequence(name) {
		if (sequences[sequenceIndex]) sequences[sequenceIndex].hide();
		const index = sequences.length;
		if (!name) name = prompt('Name this sequence') || 'Sequence ' + index;
		const sequence = new UISequence({ name: name, class: 'row' });
		panel.add(sequence, 'sequence-' + index);
		sequences.push(sequence);
		sequenceSelector.addOption(index, name);
		sequenceSelector.value = index;
	}

	function addClip(params) {
		if (sequences.length === 0) addSequence();
		const sequence = sequences[sequenceIndex];
		const index = sequence.clips.length;
		const clip = new UIClip({
			...params,
			remove: () => {
				sequence.removeClip(clip);
			}
		});
		sequence.addClip(clip);
	}

	function getData() {
		if (sequences.length === 0) return false;
		return sequences.map(s => { return { name: s.name, clips: s.getData(), }});
	}

	function load(data) {
		data.forEach(sequence => {
			addSequence(sequence.name);
			sequence.clips.forEach(clip => { addClip(clip); });
		});
	}

	function getFrame() {
		if (sequences.length === 0) return; 

		const sequence = sequences[sequenceIndex];
		if (isPlaying) {
			if (drawCount === lns.anim.dpf) {
				drawCount = 0;
				currentFrame++;
				if (currentFrame >= sequence.getEndFrame()) {
					currentFrame = 0;
					playToggle.update(false);
					if (isCapturing) {
						lns.capture.stopVideo();
						isCapturing = false;
					}
				}
			} else {
				drawCount++;
			}
		}
		frameDisplay.value = currentFrame;
		return sequence.getFrame(currentFrame);
	}

	function connect() {

		panel = lns.ui.getPanel('sequencer');

		renderSequencer = lns.ui.addProp('renderSequencer', {
			type: 'UIToggleCheck',
			value: false,
			callback: value => { isActive = value; },
			key: 'alt-q',
		});

		panel.addRow();

		playToggle = lns.ui.addUI({
			type: 'UIToggle', 
			value: false,
			"onText": "❚❚", 
			"offText": "▶",
			callback: value => {
				isPlaying = value;
				if (isPlaying && !isActive) renderSequencer.update(true);
			}, 
			key: 'alt-space',
 		});

		frameDisplay = lns.ui.addUI({ 
			type: "UINumberStep",
			value: 0,
			callback: value => { currentFrame = value }, 
		});

		lns.ui.addCallback({
			text: 'Capture',
			callback: () => {
				isCapturing = true;
				lns.capture.startVideo();
				currentFrame = 0;
				if (!isPlaying) playToggle.update(true);
				if (!isActive) renderSequencer.update(true);
			}
		});

		panel.addRow();

		lns.ui.addCallbacks([
			{ callback: addSequence, text: 'Add Sequence', },
			{ callback: addClip, text: 'Add Clip' },
		]);

		// save in settings before load means it tries to set non existent value ...
		sequenceSelector = lns.ui.addProp('sequenceSelector', {
			type: 'UISelect',
			options: sequences.map((seq, index) => { return { value: index, text: seq.name }}),
			callback: value => {
				if (!sequences[sequenceIndex]) return; // settings err
				sequences[sequenceIndex].hide();
				sequenceIndex = value; 
				sequences[sequenceIndex].show();
				lns.timeline.update();
			}
		});

	}

	return { 
		connect, load, getData, getFrame,
		isActive() { return isActive && sequences.length > 0; },
		isPlaying() { return isPlaying },
	};
}