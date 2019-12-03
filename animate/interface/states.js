function States() {
	const self = this;

	/* could be module, could be state ui class */

	this.display = function() {
		for (const key in lns.anim.states) {
			// console.log(key);
			const state = lns.anim.states[key];
			self.addUI(key, state, false);
		}
	};

	this.addUI = function(name, state, focus) {
		const states = lns.anim.states;
		const row = self.panel.addRow(`state-${name}`);
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
		
		self.panel.add(title, row);
		if (focus) title.el.focus();

		self.panel.add(new UIBlur({
			text: "Start",
			value: state.start,
			callback: function(n) {
				state.start = +n;
			}
		}), row);

		self.panel.add(new UIBlur({
			text: "End",
			value: state.end,
			callback: function(n) {
				state.end = +n;
			}
		}), row);

		self.panel.add(new UIButton({
			text: "x",
			callback: function() {
				delete lns.anim.states[title.value];
				self.panel.removeRow(row);
				lns.ui.faces.stateSelector.removeOption(title.value);
				lns.anim.state = 'default';
			}
		}), row);
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