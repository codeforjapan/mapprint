var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var changed = require('gulp-changed');
var sourcemaps = require('gulp-sourcemaps');
var neat = require('node-neat');
var notify  = require('gulp-notify');

var jsConf = {
  srcPath: 'source/javascripts/all.js',
  destFileName: 'javascripts/bundle.js',
  destPath: '.tmp/dist/'
}

var cssConf = {
  srcPath: 'source/stylesheets/**/*.scss',
  destFileName: 'site',
  destPath: '.tmp/dist/stylesheets'
}


//sass
gulp.task('sass',function(){
  return gulp.src(cssConf.srcPath)
  .pipe(sourcemaps.init())
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(sass({
    style : 'expanded',
    includePaths: cssConf.destFileName
  }))
  .pipe(sourcemaps.write())
  .pipe(changed(cssConf.destPath))
  .pipe(gulp.dest(cssConf.destPath))
  .pipe(notify({
    title: 'compiled Sass',
    message: new Date(),
    sound: 'Tink'
  }));
});


var b = browserify({
    entries: jsConf.srcPath,
    cache: {},
    packageCache: {}
});

gulp.task('bundle', jsBundle);

function jsBundle() {
    return b
      .plugin('tsify')
      .bundle()
      .pipe(source(jsConf.destFileName))
      .pipe(gulp.dest(jsConf.destPath));
}

gulp.task('build', gulp.series( gulp.parallel('sass', 'bundle')));
gulp.task('watch', function(){
  gulp.watch([jsConf.srcPath, cssConf.srcPath], gulp.task('build'));
});


gulp.task('default', gulp.task('build'));
