const { src, dest, watch, series, parallel } = require('gulp');

const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const merge = require('merge-stream');
const server = require('gulp-webserver');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const files = {
	base: [ './classes/*.js' ],
	interface: [
		'./interface/ui/Element.js',
		'./interface/ui/Collection.js',
		'./interface/ui/Input.js',
		'./interface/ui/Text.js',
		'./interface/**/*.js',
	],
	animate: [
		'./animate/modules/*.js',
		'./animate/classes/*.js',
		'./animate/interface/*.js',
		'./animate/lines.js'
	],
	game: [
		'./game/classes/Sprite.js',
		'./game/classes/UI.js',
		'./game/classes/*.js',
	]
};

const sassFiles = {
	animate: [
		'./css/animate.scss'
	],
	interface: [
		'./css/colors.scss',
		'./css/interface.scss'
	]
};

function jsTasks() {
	function jsTask(files, name, dir){
		return src(files)
			.pipe(sourcemaps.init())
			.pipe(concat(name))
			.pipe(uglify())
			.pipe(sourcemaps.write('./src_maps'))
			.pipe(dest(dir)
		);
	}

	const tasks = [];
	for (const f in files) {
		tasks.push( jsTask(files[f], `${f}.min.js`, './build') );
	}
	return merge(...tasks);
}

// Sass task: compiles the style.scss file into style.css
function sassTask(files, name, dir){    
    return src(files)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass()) // compile SCSS to CSS
        .pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
        .pipe(sourcemaps.write('./src_maps')) // write sourcemaps file in current directory
        .pipe(dest(dir)
    ); // put final CSS in dist folder
}

function sassTasks() {
	const tasks = [];
	for (const f in sassFiles) {
		tasks.push( sassTask(sassFiles[f], `${f}.min.js`, './css') );
	}
	return merge(...tasks);
}

function serverTask() {
	return src('./')
		.pipe(server({
			livereload: false,
			// open: true,
			port: 8080	// set a port to avoid conflicts with other local apps
		}));
}

// Cachebust
function cacheBustTask(){
	var cbString = new Date().getTime();
	return src(['index.html'])
		.pipe(replace(/cb=\d+/g, 'cb=' + cbString))
		.pipe(dest('.'));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask(){
	watch([...files.base, 
			...files.interface, 
			...files.animate, 
			...files.game,
			...sassFiles.interface,
			...sassFiles.animate
		],
		{interval: 1000, usePolling: true}, //Makes docker work
		series(
			parallel(jsTasks),
			parallel(sassTasks),
			cacheBustTask
		)
	);    
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
	parallel(jsTasks),
	parallel(sassTasks),
	cacheBustTask,
	serverTask,
	watchTask
);

exports.lnsFiles = files;