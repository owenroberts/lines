/*
	like footage for compositions
	should be part of footage?
	composition is collection of tracks
	can include other compositions ...
*/

function Compositions(app) {
	Object.assign(Compositions.prototype, ModuleMixin);
	const self = this;

	const compositions = { default: new Composition({}) };

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
		compositions[name] = new Composition(params ? params : {});
	};

	this.load = function(data) {
		for (const k in data) {
			self.addComposition(k, data[k]);
		}
	};

	this.get = function(name) {
		return compositions[name];
	};

}