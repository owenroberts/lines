window.addEventListener("load", function() {

	const app = {}; // main editor app
	app.addProp = Object.defineProperty;
	// Object.assign(Lines.prototype, LinesMixin);

	const params = {};
	location.search.substr(1).split('&').map(a => {
		let [key, value] = a.split('=');
		params[key] = value;
	});

	// app.clips = {}; // animations
	app.canvas = new Canvas(app, { id: "lines", checkRetina: true }); // dealing with size and height etc ...
	app.timeline = new Timeline(app);
	app.compositions = new Compositions(app);
	app.footage = new Footage(app);
	app.fio = new FileIO(app, {});
	app.renderer = new Renderer(app); // dps, fps
	app.ui = new Interface(app); // add settings here ?
	app.ui.settings = new Settings(app, 'anim-editor');
	// app.capture = new Capture(app);

	app.ui.load('./interface/interface.json', () => {
		if (params.src) app.fio.load(params.src, start); // await here ?
		else start();
	});

	function start() {
		app.ui.settings.load();
		app.renderer.start();
	}


	console.log(app);
});