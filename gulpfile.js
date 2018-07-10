var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var sass = require('gulp-sass');
var neat = require('node-neat');

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

var b = browserify({
    entries: jsConf.srcPath,
    cache: {},
    packageCache: {}
});

gulp.task('default', ['build']);
gulp.task('build', ['sass', 'bundle']);
gulp.task('watch', function(){
  //
});
gulp.task('bundle', jsBundle);
gulp.task('sass', sassPreCompile);

function jsBundle() {
    return b.bundle()
    .pipe(source(jsConf.destFileName))
        .pipe(gulp.dest(jsConf.destPath));
}

function sassPreCompile(){
  gulp.src(cssConf.srcPath)
    .pipe(sass({
        includePaths: cssConf.destFileName
    }))
    .pipe(gulp.dest(cssConf.destPath));
}