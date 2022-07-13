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
		
		function modalOptions() {
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
				const m2 = new UIModal({
					title: "ui", 
					app: app, 
					position: self.panel.position, 
					callback: function() {
						const d = options[p2.value];
						const ui = app.ui.createUI(d, d.mod, d.sub, self.panel);
						self.list.push(d);
					}
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
		}

		const m1 = new UIModal({
			title: "panels", 
			app: app, 
			position: self.panel.position,
			callback: modalOptions
		});

		const p1 = new UISelect({ options: Object.keys(data) });
		m1.add(p1);
	};

	this.addData = function(newData) {
		for (const k in newData) {
			data[k] = newData[k];
		}
	};

	// key command setup 

	this.openQuickMenu = function() {

		// populat ui optoins
		let ignoreUIs = ['UIRow', 'UILabel'];
		let options = {};

		Object.keys(data).forEach(k => {
			return data[k].uis.forEach(ui => {
				return ui.list
					.filter(u => !ignoreUIs.includes(u.type))
					.filter(u => u.key !== 'ctrl-space') // this one 
					.forEach(u => {
						let label = data[k].label + ' > ';
						let n = u.label;
						if (!n && u.params) {  
							n = u.params.text || u.params.onText || u.params.placeholder;
						}
						if (!n) n = u.face;
						if (!n) console.error('quick search fuck', u);
						label += n;
						options[label] = { ...u, module: ui.module, sub: ui.sub };
					});
			});
		});

		const m = new UIModal({
			title: "Quick Func",
			app: app,
			position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
			callback: function() {

				// gotta be a better way to do this part
				const ui = options[input.value];
				console.log(ui);

				const mod = ui.sub ? app[ui.module][ui.sub] : app[ui.module];
				let args = [];
				if (ui.params) {
					if (ui.params.args) {
						args = ui.params.args;
					}
				}
				
				if (ui.face) {
					app.ui.faces[ui.face].keyHandler();
				}

				else if (ui.fromModule) {
					if (ui.fromModule.callback) {
						mod[ui.fromModule.callback](...args);
					}
				}

				else if (ui.number) {
					mod[ui.number] = +prompt(ui.prompt || ui.label);
				}

				else if (d.toggle) {
					mod[ui.toggle] = !m[ui.toggle];
				}
			}
		});

		const input = new UIInputList({
			listName: 'quick-menu-list',
			options: Object.keys(options),
			callback: function() {
				m.clear();
				m.callback();
			}
		});

		m.add(input);
		input.input.el.focus();

		input.input.el.addEventListener('keydown', ev => {
			if (Cool.keys[ev.which] === 'escape') m.clear();
		});

	};

}