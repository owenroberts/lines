import { UISequence } from './ui-sequence';
import { UIClip } from './ui-clip.js';
import { UIModal, UISelect, UIPanel, UIRow } from '../../../oi/src/oi.js';

export class SequencerPanel extends UIPanel {
	
	constructor(ui, anim) {
		super({ id: 'sequencer', ui });
		
		this.anim = anim;

		this.sequenceSelector = this.addRef({
			obj: this.anim,
			ref: "sequenceIndex",
			options: [{ value: -1, text: 'none' }],
			ignoreSettings: true,
			callback: value => {

				if (this.sequenceRow[`seq-${this.anim.sequenceIndex}`]) {
					this.sequenceRow.children[`seq-${this.anim.sequenceIndex}`].hide();
				}
				
				this.anim.sequenceIndex = +value;

				if (this.sequenceRow[`seq-${this.anim.sequenceIndex}`]) {
					this.sequenceRow.children[`seq-${this.anim.sequenceIndex}`].show();
				}
				
				this.ui.panels.timeline.update();
				this.update();
			},
		});

		this.addBreak();

		this.addButton({ 
			text: '+sequence',
			callback: () => { this.addSequence() },
		});

		this.sequenceRow = this.add(new UIRow());
	}

	addSequence(name) {
		if (this.sequenceRow.children[`seq-${this.anim.sequenceIndex}`]) {
			this.sequenceRow.children[`seq-${this.anim.sequenceIndex}`].hide();
		}
		
		const index = this.anim.sequences.length;
		if (!name) name = prompt('name sequence', 'sequence ' + index);
		if (!name) return;

		const sequence = { name, clips: [], clipIndex: 0 };
		this.anim.sequences.push(sequence);

		this.sequenceSelector.addOption(index, name);
		this.sequenceSelector.update(index);

		this.update();
	}

	update() {

		for (let i = 0; i < this.anim.sequences.length; i++) {

			// *** fuck this
			if (!this.sequenceSelector.options.includes(''+i)) {
				this.sequenceSelector.addOption(i, this.anim.sequences[i].name);
			}
			
			if (this.sequenceRow.children[`seq-${i}`]) continue;
			this.sequenceRow.add(new UISequence({
				anim: this.anim,
				ui: this.ui,
				sequence: this.anim.sequences[i],
				class: 'row',
				remove: () => {
					this.anim.sequences.splice(i, 1);
					this.sequenceSelector.removeOption(i);
					this.sequenceRow.removeK(`seq-${i}`);
				},
				update: () => {
					this.update();
				}
			}), `seq-${i}`);
			this.addBreak();
		}
	}
}