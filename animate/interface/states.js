function States() {
	const self = this;

	/* could be module, could be state ui class */

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

		const row = self.panel.addRow(name);
		lns.anim.states[name] = state;
		lns.ui.faces.stateSelector.addOption(name);

		self.panel.add(new UILabel({
			text: name
		}), row);

		self.panel.add(new UIText({
			text: "Start",
			value: state.start,
			callback: function(n) {
				state.start = +n;
			}
		}), row, 'start');

		self.panel.add(new UIText({
			text: "End",
			value: state.end,
			callback: function(n) {
				state.end = +n;
			}
		}), row, 'end');

		self.panel.add(new UIButton({
			text: "x",
			callback: function() {
				delete lns.anim.states[name];
				self.panel.removeRow(row);
				lns.ui.faces.stateSelector.removeOption(name);
				lns.anim.state = 'default';
				lns.ui.faces.stateSelector.value = 'default';
			}
		}), row);
		return row;
	};

	this.set = function(state) {
		lns.anim.state = state;
		lns.ui.update();
	};

	this.create = function() {
		const name = prompt('Name?');
		self.addUI(name, { 
			start: lns.anim.currentFrame, 
			end: lns.anim.currentFrame 
		}, true);
		lns.anim.state = name;
		lns.ui.faces.stateSelector.value = name;
	};
}