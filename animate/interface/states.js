function States(panel) {
	const self = this;

	this.displayStates = function() {
		for (const key in lns.anim.states) {
			const state = lns.anim.states[key];
			self.addStateUI(key, state, false);
		}
	};

	this.addStateUI = function(name, state, focus) {
		const states = lns.anim.states;
		const row = panel.addRow(`state-${name}`);
		const title = new UIBlur({
			value: name,
			callback: function(value) {
				if (!Object.keys(lns.anim.states).includes(value)) {
					lns.anim.states[value] = state;	
					self.setState(value);
					lns.ui.faces.stateSelector.addOption(value);
					lns.ui.faces.stateSelector.setValue(value);
				}
			}
		})
		panel.add(title, row);
		if (focus) title.el.focus();

		panel.add(new UIBlur({
			title: "Start",
			value: state.start,
			callback: function(n) {
				state.start = +n;
			}
		}), row);

		panel.add(new UIBlur({
			title: "End",
			value: state.end,
			callback: function(n) {
				state.end = +n;
			}
		}), row);
	};

	/* not DRY */
	this.setState = function(state) {
		lns.anim.state = state;
	};

	this.createState = function() {
		const state = { 
			start: lns.anim.currentFrame, 
			end: lns.anim.currentFrame 
		};
		// lns.anim.states[label || 'new state'] = state;
		// if (label != 'new state' && label) 
			// lns.ui.faces.stateSelector.addOption(label);
		// console.log(label);
		self.addStateUI('new state', state, true);
	};

	this.updateOptions = function() {
		lns.ui.faces.stateSelector.options = Object.keys(lns.anim.states);
	};
}