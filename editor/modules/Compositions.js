/*
	like footage for compositions
	should be part of footage?
	composition is collection of tracks
	can include other compositions ...
*/

function Compositions(app) {
	Object.assign(Compositions.prototype, ModuleMixin);
	const self = this;

	const compositions = {};

	this.addProp('data', {
		get: () => {
			const data = {};
			for (const k in compositions) {
				data[k] = compositions[k].data;
			}
			return data;
		}
	});

	this.addComposition = function(name, params) {
		if (!name) name = prompt("Composition name", "New Composition");
		compositions[name] = new Composition(params ? params : {});
		self.addUI(name);
	};

	this.load = function(data) {
		for (const k in data) {
			self.addComposition(k, data[k]);
		}
	};

	this.get = function(name) {
		return compositions[name];
	};

	this.addUI = function(name) {
		const rowName = name + '-row';
		const row = self.panel.addRow(rowName);
		row.addClass('ui-composition');
		

		self.panel[rowName].append(new UIText({
			text: name,
			callback: value => {
				const comp = Object.getOwnPropertyDescriptor(compositions, name);
				Object.defineProperty(compositions, value, comp);
				delete compositions[name];
			}
		}));
		
		self.panel[rowName].append(new UIButton({
			text: 'Edit',
			callback: () => {
				app.timeline.composition = name;
			}
		}));
		
		self.panel[rowName].append(new UIButton({
			text: '+',
			callback: () => {
				app.timeline.composition.addComposition(compositions[name]);
			}
		}));
		
		self.panel[rowName].append(new UIButton({
			text: "X",
			callback: () => {
				delete compositions[name];
				self.panel.removeRow(row);
			}
		}));
	};

}