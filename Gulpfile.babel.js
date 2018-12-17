import gulp from 'gulp';
import ghPages from 'gulp-gh-pages';
let browserify = require("browserify");
let source = require('vinyl-source-stream');
let tsify = require("tsify");

gulp.task('deploy', () => {
  return gulp.src('build/**/*')
      .pipe(ghPages());
});

gulp.task('copy', function() {
    return gulp.src(['index.html', 'main.js', 'styles.css', 'header.html','*-*/*'])
        .pipe(gulp.dest('build'));
});

gulp.task("ts7", function () {
  return browserify({
    basedir: '7-Logical-Agents',
    debug: true,
    entries: ['main.ts'],
    cache: {},
    packageCache: {}
  }).plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("7-Logical-Agents"));
});

gulp.task('default', ['ts7', 'copy']);
