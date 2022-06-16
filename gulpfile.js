const { src, dest, watch, series, parallel, task } = require('gulp');

const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const merge = require('merge-stream');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');

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

const files = {
	base: [ 
		'./lib/cool/cool.js',
		'./classes/*.js',
	],
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
		'./animate/animate.js'
	],
	game: [
		'./game/classes/Sprite.js',
		'./game/classes/ColliderSprite.js',
		'./game/classes/UI.js',
		'./game/classes/Scene.js',
		'./game/classes/*.js',
	],
	editor: [
		'./game/editor/classes/*.js',
		'./game/editor/modules/*.js',
		'./game/editor/interface/*.js',
		'./game/editor/editor.js',
	]
};

const sassFiles = {
	animate: [
		'./css/animate.scss'
	],
	interface: [
		'./css/colors.scss',
		'./css/interface.scss'
	],
	editor: [
		'./css/editor.scss'
	]
};

function browserSyncTask() {
	return browserSync.init({
		port: 8080,
		server: {
			baseDir: './',
		}
	});
}

function jsTasks() {
	function jsTask(files, name, dir){
		return src(files)
			/* .pipe(plumber({ errorHandler: function(err) {
				if (beeper) {
					notify.onError({
						title: "Gulp error in " + err.plugin,
						message:  err.toString()
					})(err);
					gutil.beep();
				} else {
					console.log("Gulp error in " + err.plugin, err.toString());
				}
			}})) */
			.pipe(sourcemaps.init())
			.pipe(concat(name))
			.pipe(terser().on('error', function(ugly) {
				console.error('* gulp-terser error', ugly.message, ugly.filename, ugly.line, ugly.col, ugly.pos);
			}))
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

function exportTask() {
	function jsTask(files, name, dir) {
		return src(files)
			.pipe(sourcemaps.init())
			.pipe(concat(name))
			.pipe(uglify())
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

function sassTask(files, name, dir){    
    return src(files)
    	.pipe(plumber({ errorHandler: function(err) {
			notify.onError({
				title: "Gulp error in " + err.plugin,
				message:  err.toString()
			})(err);
			gutil.beep();
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
		tasks.push( sassTask(sassFiles[f], `${f}.min.js`, './css') );
	}
	return merge(...tasks);
}

function libTask() {
	return src(npmDist(), { base: './node_modules' })
		.pipe(dest('./build/lib'));
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
	watch([	
			...files.base,
			...files.interface,
			...files.animate,
			...files.game,
			...files.editor,
		],
		series(jsTasks),
	); 

	watch([
			...sassFiles.interface,
			...sassFiles.animate,
			...sassFiles.editor,
		],
		series(sassTasks),
	);    
}

task('js', jsTasks);
task('sass', sassTasks);
task('lib', libTask);
task('build', series(libTask, jsTasks, sassTasks));
task('default', parallel(jsTasks, sassTasks));
task('watch', watchTask);
task('browser', parallel(jsTasks, sassTasks, cacheBustTask, browserSyncTask, watchTask));

module.exports = {
	exportTask: exportTask,
	files: files
};