/*
	animation states, subset of frames 
*/

function States(lns) {

	let panel;

	function update() {
		for (const key in lns.anim.states) {
			const state = lns.anim.states[key];
			const ui = panel[key] ? panel[key] : addUI(key, state, false);
			for (const part in state) {
				if (ui[part].value !== state[part]) ui[part].value = state[part];
			}
		}
	}

	function addUI(name, state, focus) {

		const row = panel.addRow(name, 'break');
		lns.anim.states[name] = state;
		
		// selector.addOption(name);
		lns.ui.faces.stateSelect.addOption(name);

		row.append(new UILabel({ text: name }));

		row.append(new UIButton({
			text: '⊙',
			callback() { set(name); }
		}))

		row.append(new UINumberStep({
			value: state.start,
			callback: value => { state.start = value; }
		}), 'start');

		row.append(new UINumberStep({
			value: state.end,
			callback: value => { state.end = value; }
		}), 'end');

		row.append(new UIButton({
			text: "x",
			callback: function() {
				delete lns.anim.states[name];
				panel.removeRow(row);
				lns.anim.state = 'default';
				lns.ui.faces.stateSelect.value = 'default';
				lns.ui.faces.stateSelect.removeOption(name);
			}
		}));
		return row;
	}

	function set(state) {
		if (state) {
			lns.anim.state = state;
			lns.ui.faces.stateSelect.value = state;
			lns.ui.update();
			return;
		}

		const m = new UIModal({
			app: lns,
			title: "Choose State",
			position: lns.mousePosition,
		});

		for (const key in lns.anim.states) {
			m.add(new UIButton({
				text: key,
				callback: () => {
					lns.anim.state = key;
					lns.ui.faces.stateSelect.value = key;
					m.clear();
					lns.ui.update();
				}
			}));
		}
	}

	function create() {
		const name = prompt('Name?');
		if (!name) return;
		addUI(name, { 
			start: lns.anim.currentFrame, 
			end: lns.anim.currentFrame 
		}, true);
		lns.anim.state = name;
		lns.ui.faces.stateSelect.value = name;
	}

	function connect() {
		panel = lns.ui.getPanel('states');

		lns.ui.addCallbacks([
			{ callback: create, key: 't', text: 'Create New',  },
			{ callback() { set('default'); }, key: 'shift-t', text: 'Default' },
		]);

		panel.addRow(undefined, 'break');
	}

	return { connect, update, set };
}