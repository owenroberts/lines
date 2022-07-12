/*
	module for running a function or adding uis to quick ref menu
*/

function QuickRef(app) {
	const self = this;
	const data = {};
	const defaultFontSize = 11;

	this.fontSize = 11;
	this.list = [];

	this.setScale = function(value) {
		self.fontSize = +value;
		document.body.style.setProperty('--quick-ref-font-size', +value);
	};

	this.reset = function() {
		lns.ui.faces.quickRefScale.update(defaultFontSize);
	};

	this.addRef = function() {
		// m1 choose a panel
		const m1 = new UIModal("panels", app, self.panel.position, function() {
			const options = {};
			data[p1.value].uis.forEach(ui => {
				ui.list.forEach(el => {

					let createQuickUI = (el.number || el.toggle) ? true : false;
					if (el.fromModule) createQuickUI = el.fromModule.callback ? true : false;

					if (createQuickUI) {
						const title = el.params ? 
							el.params.text || el.params.onText || el.params.label || el.face:
							el.fromModule.callback;
						
						el.mod = ui.module;
						el.sub = ui.sub;

						options[title] = el;
					}
				});
			});

			if (Object.keys(options).length > 0) {
				// m2 choose a callback
				const m2 = new UIModal("ui", app, self.panel.position, function() {
					const d = options[p2.value];
					const ui = app.ui.createUI(d, d.mod, d.sub, self.panel);
					self.list.push(d);
				});

				const p2 = new UISelect({
					options: Object.keys(options)
				});
				m2.add(p2);

				const callFunc = new UIButton({
					text: "Execute",
					callback: function() {
						m2.clear();
						const d = options[p2.value];
						console.log(d);

						const m = d.sub ? app[d.mod][d.sub] : app[d.mod];
						// most callbacks
						if (d.fromModule) {
							if (d.fromModule.callback) {
								m[d.fromModule.callback]();
							}
						}

						/* 
							direct set properties, toggle, number 
							doesn't update ui
						*/
						if (d.number) {
							m[d.number] = +prompt(d.prompt || d.label);
						}

						if (d.toggle) {
							m[d.toggle] = !m[d.toggle];
						}

					}
				});
				m2.add(callFunc);
			} else {
				m1.clear();
			}
		});

		const p1 = new UISelect({ options: Object.keys(data) });
		m1.add(p1);
	};

	this.addData = function(newData) {
		for (const k in newData) {
			data[k] = newData[k];
		}
	};

}