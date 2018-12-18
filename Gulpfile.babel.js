import gulp from 'gulp';
import ghPages from 'gulp-gh-pages';
let browserify = require("browserify");
let source = require('vinyl-source-stream');
let tsify = require("tsify");
let watchify = require("watchify");
let gutil = require("gulp-util");

/**
 * Gulp Task: Deploy
 * Updates the gh-pages remote of your repository with the published version of the site
 */
gulp.task('deploy', () => {
  return gulp.src('build/**/*')
      .pipe(ghPages());
});

/**
 * Gulp Task: Copy
 * Generates the Build folder
 */
gulp.task('copy', function() {
    return gulp.src(['index.html', 'main.js', 'styles.css', 'header.html','*-*/*'])
        .pipe(gulp.dest('build'));
});


/**
 * watchCH7 and bundleCH7
 * Compile all TypeScript files to a bundled.js file for Chapter 7
 */
let watchCh7 = watchify(browserify({
  basedir: '7-Logical-Agents',
  debug: true,
  entries: ['main.ts'],
  cache: {},
  packageCache: {}
}).plugin(tsify));

function bundleCh7() {
  return watchCh7
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("7-Logical-Agents"));
}

/**
 * Gulp Task: dev - Development
 * Compile and Watch files
 */

function bundle() {
  bundleCh7();
}
gulp.task('devCh7', () => {
  watchCh7.on("update", bundleCh7);
  watchCh7.on("log", gutil.log);
});
gulp.task('dev', ['devCh7'] , bundle);

/**
 * Gulp Task: default - Development
 * Compile and Watch files
 */

gulp.task('default', ['copy', 'deploy'], bundle);