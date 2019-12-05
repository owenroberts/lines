function States() {
	const self = this;

	/* could be module, could be state ui class */

	this.update = function() {
		for (const key in lns.anim.states) {
			const state = lns.anim.states[key];
			const ui = self.panel[key] ? self.panel[key] : self.addUI(key, state, false);
			for (const part in state) {
				if (ui[part].value != state[part])
					ui[part].value = state[part];
			}
		}
	};

	this.addUI = function(name, state, focus) {

		const row = self.panel.addRow(name);
		const title = new UIBlur({
			value: name,
			callback: function(value) {
				if (!Object.keys(lns.anim.states).includes(value)) {
					lns.anim.states[value] = state;
					lns.anim.state = value;
					lns.ui.faces.stateSelector.addOption(value);
					lns.ui.faces.stateSelector.value = value;
				}
			}
		});
		
		self.panel.add(title, row, 'title');
		if (focus) title.el.focus();

		self.panel.add(new UIBlur({
			text: "Start",
			value: state.start,
			callback: function(n) {
				state.start = +n;
			}
		}), row, 'start');

		self.panel.add(new UIBlur({
			text: "End",
			value: state.end,
			callback: function(n) {
				state.end = +n;
			}
		}), row, 'end');

		self.panel.add(new UIButton({
			text: "x",
			callback: function() {
				delete lns.anim.states[title.value];
				self.panel.removeRow(row);
				lns.ui.faces.stateSelector.removeOption(title.value);
				lns.anim.state = 'default';
			}
		}), row);

		return row;
	};

	this.set = function(state) {
		lns.anim.state = state;
	};

	this.create = function() {
		self.addUI('new state', { 
			start: lns.anim.currentFrame, 
			end: lns.anim.currentFrame 
		}, true);
	};
}