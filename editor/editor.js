window.addEventListener("load", function() {

	const app = {}; // main editor app

	app.modulePrototype = {
		addProp(prop, funcs) {
			Object.defineProperty(this, prop, {
				get: funcs.get,
				set: funcs.set
			});
		}
	};

	const params = {};
	location.search.substr(1).split('&').map(a => {
		let [key, value] = a.split('=');
		params[key] = value;
	});

	app.canvas = new Canvas(app, { id: "lines", checkRetina: true }); // dealing with size and height etc ...
	app.footage = new Footage(app);
	app.fio = new FileIO(app, {});

	// app.renderer = new Renderer(app, 30); // dps
	app.ui = new Interface(app); // add settings here ?
	app.ui.settings = new Settings(app, 'anim-editor');
	// app.capture = new Capture(app);
	// app.timeline = new Timeline(app);

	app.ui.load('./interface/interface.json', () => {
		if (params.src) app.fio.load(params.src);
		app.ui.settings.load();
	});


	console.log(app);
});