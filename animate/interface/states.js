function States() {
	const self = this;

	/* could be module, could be state ui class */

	this.display = function() {
		for (const key in lns.anim.states) {
			const state = lns.anim.states[key];
			self.addUI(key, state, false);
		}
	};

	this.update = function() {
		for (const key in lns.anim.states) {
			const state = lns.anim.states[key];
			const ui = self.panel[key];
			for (const part in state) {
				if (ui[part].value != state[part])
					ui[part].value = state[part];
			}
		}
	};

	this.addUI = function(name, state, focus) {

		/*
			use ids to update values ?? 
		*/

		const row = self.panel.addRow(name);
		const title = new UIBlur({
			value: name,
			id: 'title',
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
			id: "start",
			value: state.start,
			callback: function(n) {
				state.start = +n;
			}
		}), row);

		self.panel.add(new UIBlur({
			text: "End",
			id: "end",
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