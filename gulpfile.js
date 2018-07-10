var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

var paths = {
    srcPath: 'source/javascripts/all.js',
    destFileName: 'javascripts/bundle.js',
    destPath: '.tmp/dist'
}

var b = browserify({
    entries: paths.srcPath,
    cache: {},
    packageCache: {}
});

gulp.task('default', ['build']);
gulp.task('build', bundle);
gulp.task('watch', function(){
  //
});

function bundle() {
    return b.bundle()
    .pipe(source(paths.destFileName))
        .pipe(gulp.dest(paths.destPath));
}
