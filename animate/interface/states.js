function States(panel) {
	const self = this;

	this.displayStates = function() {
		self.reset();
		const states = lns.anim.states;
		
		for (const key in states) {
			const state = states[key];
			const row = panel.addRow(`state-${key}`);

			panel.add(new UIText({
				title: key,
				blur: true,
				callback: function(value) {
					if (value !== key) {
						Object.defineProperty(states, value, Object.getOwnPropertyDescriptor(states, key));
						delete states[key];
						lns.ui.faces.stateSelector.addOption(value);
					} else {
						self.createState(value);
					}
					self.setState(value);
				}
			}), row);

			panel.add(new UIText({
				title: "Start",
				blur: true,
				value: state.start,
				callback: function(n) {
					state.start = +n;
				}
			}), row);

			panel.add(new UIText({
				title: "End",
				blur: true,
				value: state.end,
				callback: function(n) {
					state.end = +n;
				}
			}), row);
		}
	};

	this.reset = function() {
		for (let i = panel.rows.length - 1; i > 0; i--) {
			panel.removeRow(panel.rows[i]);
		}		
	};

	/* not DRY */
	this.setState = function(state) {
		lns.anim.state = state;
	};

	this.createState = function(label) {
		lns.anim.states[label || 'new state'] = { start: lns.anim.currentFrame, end: lns.anim.currentFrame };
		if (label != 'new state' && label) lns.ui.faces.stateSelector.addOption(label);
		self.displayStates();
	};

	this.updateOptions = function() {
		lns.ui.faces.stateSelector.options = Object.keys(lns.anim.states);
	};
}