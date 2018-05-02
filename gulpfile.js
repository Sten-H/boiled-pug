const gulp = require('gulp')
const pug = require('gulp-pug')
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');

const distPath = './dist';
const appPath = './app';
const srcPath = appPath + '/src';
const resourcesPath = appPath + '/resources';

// PUG
gulp.task('build-pug', () => {
  gulp.src(srcPath + '/**/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.reload({ stream: true }))
});

gulp.task('watch-pug', () => {
  gulp.watch(srcPath + '/**/*.pug', ['build-pug']); 
});

// SASS
gulp.task('build-sass', function(){
  return gulp.src(srcPath + '/styles/**/*.+(scss|sass)')
    .pipe(sass())
    .pipe(gulp.dest('./dist/styles'))
    .pipe(browserSync.reload({ stream: true}))
});

gulp.task('watch-sass', () => {
  gulp.watch(srcPath + '/styles/**/*.+(scss|sass)', ['build-sass']); 
});

// RESOURCES
// TODO very barebones
gulp.task('build-resources', () => {
  gulp.src(resourcesPath + '/**/*.*')
    .pipe(gulp.dest('./dist/resources'))
});

gulp.task('watch-resources', () => {
  gulp.watch(resourcesPath + '/**/*.*', ['build-resources']);
});

// ES6
function compileJS(watch) {
  var bundler = watchify(browserify(srcPath + '/js/index.js', { debug: true })
  .transform(babelify, {
    presets: [
      [
        "env", {
          // this is some sort of weird workaround for async functions bug(?) https://github.com/babel/babel/issues/5085
          "targets": {
            "node": "current"
          }
        }
      ]
    ]
  }));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'))
      .pipe(buffer())
      .pipe(browserSync.reload({ stream: true }));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

const watchJS = () => {
  return compileJS(true);
};

gulp.task('build-js', function() { return compileJS(); });
gulp.task('watch-js', function() { return watchJS(); });

// Auto reload browser
gulp.task('browserSync', function() {
  browserSync.init({
    notify: false,  // Who wants this on?? Lunatics.
    server: {
      baseDir: 'dist'
    },
  })
});

gulp.task('build', () => {
  gulp.start('build-sass');
  gulp.start('build-pug');
  gulp.start('build-js');
  gulp.start('build-resources');
});

gulp.task('serve', ['browserSync', 'build'], () => {
  gulp.start('watch-sass');
  gulp.start('watch-pug');
  gulp.start('watch-js');
  gulp.start('watch-resources');
});