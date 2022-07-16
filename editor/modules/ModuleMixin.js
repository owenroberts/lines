const ModuleMixin = {
	addProp(prop, funcs) {
		Object.defineProperty(this, prop, {
			get: funcs.get,
			set: funcs.set
		});
	}
}