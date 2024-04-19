/*
	play sequences based on states
*/

import { UISequence } from './UISequence.js';
import { UIClip } from './UIClip.js';


export function Sequencer(lns) {

	let panel, sequenceSelector;

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
		const sequence = new UISequence({ name: name, class: 'row', update });
		panel.add(sequence, 'sequence-' + index);
		sequences.push(sequence);
		sequenceSelector.addOption(index, name);
		sequenceSelector.update(index);
		panel.addBreak();

		update();
	}

	function addClip(params) {
		if (sequences.length === 0) addSequence();
		const sequence = sequences[sequenceIndex];
		const index = sequence.clips.length;
		const clip = new UIClip({
			...params,
			update,
			remove: () => {
				sequence.removeClip(clip);
			}
		});
		sequence.addClip(clip);
		update();
	}

	function update() {
		if (sequences.length === 0) return false;
		// return sequences.map(s => { return { name: s.name, clips: s.getData(), }});
		lns.anim.sequences = sequences.map(s => { return { 
			name: s.name,
			clips: s.getData(),
			clipIndex: 0,
		}});
		lns.anim.sequenceIndex = sequenceIndex;
	}

	function load(data) {
		// console.log(data);
		data.forEach(sequence => {
			addSequence(sequence.name);
			sequence.clips.forEach(clip => { addClip(clip); });
		});
	}

	function connect() {

		panel = lns.ui.getPanel('sequencer');

		// save in settings before load means it tries to set non existent value ...
		sequenceSelector = lns.ui.addProp('sequenceSelector', {
			type: 'UISelect',
			options: [{ value: -1, text: 'None' }],
			callback: value => {
				// if (!sequences[sequenceIndex]) return; // settings err
				if (sequences[sequenceIndex]) sequences[sequenceIndex].hide();
				sequenceIndex = value;
				if (sequences[sequenceIndex]) sequences[sequenceIndex].show();
				lns.timeline.update();
				update();
			}
		});

		panel.addBreak();

		lns.ui.addCallbacks([
			{ callback: addSequence, text: 'Add Sequence', },
			{ callback: addClip, text: 'Add Clip' },
		]);

		panel.addBreak();
	}

	return { connect, load, update, };
}