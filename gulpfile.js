const gulp = require('gulp');
const { src, dest, parallel, series, watch } = require('gulp');

// Load plugins

const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const browsersync = require('browser-sync').create();
const reload = browsersync.reload;
const fileinclude = require('gulp-file-include');
const prettyHtml = require('gulp-pretty-html');
const replace = require('gulp-replace');
const removeEmptyLines = require('gulp-remove-empty-lines');

// Clean assets
function clear() {
  const path = [{ destination: 'dist/*' }];

  for (var i = 0; i < path.length; i++) {
    return src(path[i].destination, {
      read: false,
    }).pipe(clean({ force: true }));
  }
}

function font(done) {
  return src(['./src/fonts/**/*.*']).pipe(dest('./dist/assets/fonts'));
  done();
}

function js() {
  const source = src(['!./src/js/lib/*.*', './src/js/**']);
  return src(source).pipe(changed(source)).pipe(concat('bundle.js')).pipe(dest('./dist/assets/js/')).pipe(browsersync.stream());
}

function lib_js(done) {
  return src(['./src/js/lib/*.*']).pipe(dest('./dist/assets/js/lib'));
  done();
}

function css() {
  const source = './src/scss/style.scss';

  return gulp
    .src(source, { sourcemaps: true })
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 2 versions'],
        cascade: false,
      }),
    )
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./dist/assets/css/', { sourcemaps: true }))
    .pipe(browsersync.stream());
}

function image() {
  return src(['./src/images/**']).pipe(imagemin()).pipe(dest('./dist/assets/images'));
}

function html(done) {
  return src(['./src/html/**/*.*', '!./src/html/component/**/*.*', '!./src/html/block/**'])
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: './src/html/component',
      }),
    )
    .pipe(replace('<!-- prettier-ignore -->', ''))
    .pipe(
      prettyHtml({
        indent_size: 2,
        indent_char: ' ',
        unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br'],
      }),
    )
    .pipe(
      removeEmptyLines({
        removeComments: false,
      }),
    )
    .pipe(dest('./dist/html'));
  done();
}

// Watch files
function watchFile() {
  watch('./src/scss/**', css);
  watch('./src/js/**', js);
  watch('./src/images/**', image);
  watch('./src/html/**/*.*', html);
}

// BrowserSync
function browserSync() {
  browsersync.init({
    server: {
      baseDir: './',
    },
    port: 3000,
  });

  watch('./src/**').on('change', reload);
}

// Tasks to define the execution of the functions simultaneously or in series

exports.clear = series(clear);
exports.watch = parallel(watchFile, browserSync);
exports.build = parallel(font, css, js, lib_js, html, image);
