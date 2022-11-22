const { src, dest, watch, series, parallel, task } = require('gulp');

const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const merge = require('merge-stream');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');
const iife = require('gulp-iife');

const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gutil = require('gulp-util');

const npmDist = require('gulp-npm-dist');

const beeper = process.argv.includes('--beep') || !process.argv.includes('-b');
console.log('beeper is ' + (beeper ? 'active!' : 'not active'));
let useBrowserSync = true;

const ui = require('./ui/gulpfile');
const logger = require('node-color-log');

const files = {
	lines: [ 
		'./lib/cool/cool.js',
		'./src/**/*.js',
	],
	animate: [
		// './animate/modules/*.js',
		//'./animate/classes/*.js',
		//'./animate/interface/*.js',
		'./animate/src/AnimationMixin.js',
		'./animate/src/LayerMixin.js',
		'./animate/src/DrawingMixin.js',
		// './animate/src/UILayer.js',
		'./animate/src/animate.js',
		'./animate/src/**/*.js'
	],
	game: [
		'./game/src/Game.js',
		'./game/src/Sprite.js',
		'./game/src/ColliderSprite.js',
		'./game/src/UI.js',
		'./game/src/Scene.js',
		'./game/src/*.js',
	],
	editor: [
		'./game/editor/classes/*.js',
		'./game/editor/modules/*.js',
		'./game/editor/interface/*.js',
		'./game/editor/editor.js',
	]
};

const sassFiles = {
	animate: ['./animate/css/animate.scss'],
	// editor: ['./css/editor.scss'],
	// animEditor: ['./css/animEditor.scss'],
};

function browserSyncTask() {
	return browserSync.init({
		port: 8080,
		server: {
			baseDir: './',
		}
	});
}

function logError(err) {
	logger
		.color('red')
		.log('* gulp-terser error', err.message, err.filename, err.line, err.col, err.pos);
}

function jsTasks() {
	function jsTask(files, name, dir) {
		return src(files)
			.pipe(sourcemaps.init())
			.pipe(concat(name))
			.pipe(iife())
			.pipe(terser().on('error', logError))
			.pipe(sourcemaps.write('./src_maps'))
			.pipe(dest(dir))
			.pipe(gulpif(useBrowserSync, browserSync.stream()));
	}

	const tasks = [];
	for (const f in files) {
		tasks.push(jsTask(files[f], `${f}.min.js`, './build'));
	}
	return merge(...tasks);
}

function testBuild() {
	function jsTask(files, name, dir){
		return src(files)
			.pipe(sourcemaps.init())
			.pipe(terser().on('error', logError))
			.pipe(sourcemaps.write('./src_maps'))
			.pipe(dest(dir))
			.pipe(gulpif(useBrowserSync, browserSync.stream()));
	}

	const tasks = [];
	for (const f in files) {
		tasks.push(jsTask(files[f], `${f}.min.js`, './buildTest'));
	}
	return merge(...tasks);
}

function exportTask() {
	function jsTask(files, name, dir) {
		return src(files)
			.pipe(sourcemaps.init())
			.pipe(concat(name))
			.pipe(iife())
			.pipe(terser().on('error', logError))
			.pipe(sourcemaps.write('./src_maps'))
			.pipe(dest(dir));
	}

	const tasks = [];
	for (const f in files) {
		const nFiles = files[f].map(_f => _f.replace('./', './lines/'));
		tasks.push(jsTask(nFiles, `${f}.min.js`, './lines/build'));
	}

	return merge(...tasks);
}

function sassTask(files, name, dir) {
	return src(files)
		.pipe(plumber({ errorHandler: function(err) {
			notify.onError({
				title: "Gulp error in " + err.plugin,
				message:  err.toString()
			})(err);
		}}))
		.pipe(sourcemaps.init()) // initialize sourcemaps first
		.pipe(sass()) // compile SCSS to CSS
		.pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
		.pipe(sourcemaps.write('./src_maps')) // write sourcemaps file in current directory
		.pipe(dest(dir))
		.pipe(gulpif(useBrowserSync, browserSync.stream()));
}

function sassTasks() {
	const tasks = [];
	for (const f in sassFiles) {
		tasks.push(sassTask(sassFiles[f], `${f}.min.js`, `./${f}/css/`));
	}
	return merge(...tasks);
}

function libTask() {
	return src(npmDist(), { base: './node_modules' })
		.pipe(dest('./build/lib'));
}

function cacheBustTask(){
	var cbString = new Date().getTime();
	return src(['index.html'])
		.pipe(replace(/cb=\d+/g, 'cb=' + cbString))
		.pipe(dest('.'));
}

function watchTask(){
	watch([	
			...files.lines,
			...files.animate,
			...files.game,
			...files.editor,
		],
		series(jsTasks),
	); 

	watch([
			// ...sassFiles.interface,
			...sassFiles.animate,
			// ...sassFiles.editor,
			// ...sassFiles.animEditor,
		],
		series(sassTasks),
	);

	if (ui) {
		watch('ui/src/**/*.js', series('ui'));
		watch(['ui/css/*.scss'], series('sass'));
	}
}

function uiCopy() {
	if (!ui) return;
	return src('./ui/build/**/*')
		.pipe(dest('./build'))
		.pipe(browserSync.stream());
}

task('js', jsTasks);
task('sass', sassTasks);
task('lib', libTask);
task('build', series(libTask, jsTasks, sassTasks));
task('default', parallel(jsTasks, sassTasks));
task('watch', watchTask);
task('browser', parallel(jsTasks, sassTasks, cacheBustTask, browserSyncTask, watchTask));
if (ui) task('ui', series(function exporter() { return ui.exportTask(false) }, uiCopy));
task('test', testBuild);

module.exports = {
	exportTask: exportTask,
	files: files
};