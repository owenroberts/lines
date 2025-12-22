import { UIPanel, UILabel, UIButton, UINumberStep, UISelect, UIModal, UIToggleCheck } from '../../../oi/src/oi.js';

/**
 * animation states, subset of frames 
 * rename clips?
 */
export class StatesPanel extends UIPanel {
	constructor(ui, anim) {
		super({ id: 'states', ui });
		this.setStyle("max-width", "360px");

		this.anim = anim;

		this.addButtons(
			{ obj: this },
			[
				{ callback: () => { this.set('default'); }, key: 'shift-t', text: 'default' },
				{ ref: "create", key: 't', text: "+" },
			]
		);
	}

	update() {
		for (const name in this.anim.states) {
			const state = this.anim.states[name];
			const component = this.children[`${name}-state`] ?? this.addUI(name, state, false);
			for (const k in state) {
				// console.log(k, state, component)
				component.children[k].value = state[k];
			}
		}
	}

	addUI(name, state, focus) {

		const row = this.addRow({ id: `${name}-state`, class: "break" });

		this.anim.states[name] = state;
		
		this.ui.faces.stateSelect.addOption(name);

		row.addLabel(name);

		if (name !== "default") {
			row.add(new UIButton({
				text: "x",
				callback: function() {
					delete this.anim.states[name];
					this.removeRow(row);
					this.anim.state = 'default';
					this.ui.faces.stateSelect.value = 'default';
					this.ui.faces.stateSelect.removeOption(name);
				}
			}));
		}

		row.add(new UIButton({
			text: '⊙',
			callback: () => { this.set(name); }
		}));

		row.add(new UINumberStep({
			obj: state,
			ref: "start",
			callback: () => { this.ui.update(); },
		}), 'start');

		row.add(new UINumberStep({
			obj: state,
			ref: "end",
			callback: () => { this.ui.update(); },
		}), 'end');

		row.addLabel('↹');

		row.add(new UISelect({
			value: state.dir ?? 1,
			options: [-1, 1],
			callback: value => { 
				state.dir = +value;
				this.ui.update(); 
			}
		}), 'dir');

		row.add(new UILabel({ text: '↻' }));

		row.add(new UIToggleCheck({
			obj: state,
			ref: "loop",
		}), 'loop');

		return row;
	}

	set(state) {
		if (state) {
			this.anim.state = state;
			this.ui.faces.stateSelect.value = state;
			if (state === 'default') {
				this.anim.currentFrame = this.anim.state.start;
			}
			this.ui.update();
			return;
		}

		const m = new UIModal({
			ui: this.ui,
			title: "select state",
		});

		for (const name in this.anim.states) {
			m.add(new UIButton({
				text: name,
				callback: () => {
					this.anim.state = name;
					this.ui.faces.stateSelect.value = name;
					m.clear();
					this.ui.update();
				}
			}));
		}
	}

	create() {
		const name = prompt('name?');
		if (!name) return;
		this.addUI(name, { 
			start: this.anim.currentFrame, 
			end: this.anim.currentFrame,
			dir: 1,
			loop: true,
		}, true);
		this.anim.state = name;
		this.ui.faces.stateSelect.value = name;
	}
}