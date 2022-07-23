function States() {
	const self = this;

	this.update = function() {
		for (const key in lns.anim.states) {
			const state = lns.anim.states[key];
			const ui = self.panel[key] ? self.panel[key] : self.addUI(key, state, false);
			for (const part in state) {
				if (ui[part].value !== state[part]) ui[part].value = state[part];
			}
		}
	};

	this.addUI = function(name, state, focus) {

		const row = self.panel.addRow(name, 'break');
		lns.anim.states[name] = state;
		lns.ui.faces.stateSelector.addOption(name);

		row.append(new UILabel({ text: name }));

		row.append(new UINumber({
			value: state.start,
			callback: function(n) {
				state.start = +n;
			}
		}), 'start');

		row.append(new UINumber({
			value: state.end,
			callback: function(n) {
				state.end = +n;
			}
		}), 'end');

		row.append(new UIButton({
			text: "x",
			callback: function() {
				delete lns.anim.states[name];
				self.panel.removeRow(row);
				lns.ui.faces.stateSelector.removeOption(name);
				lns.anim.state = 'default';
				lns.ui.faces.stateSelector.value = 'default';
			}
		}));
		return row;
	};

	this.set = function(state) {
		if (!state) {
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
						lns.ui.faces.stateSelector.value = key;
						m.clear();
						lns.ui.update();
					}
				}))
			};
		} else {
			lns.anim.state = state;
			lns.ui.update();
		}
	};

	this.create = function() {
		const name = prompt('Name?');
		if (!name) return;
		self.addUI(name, { 
			start: lns.anim.currentFrame, 
			end: lns.anim.currentFrame 
		}, true);
		lns.anim.state = name;
		lns.ui.faces.stateSelector.value = name;
	};
}