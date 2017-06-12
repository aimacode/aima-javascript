import gulp from 'gulp';
import ghPages from 'gulp-gh-pages';
import jspm from 'jspm';

gulp.task('deploy', () => {
  return gulp.src('build/**/*')
      .pipe(ghPages());
});

gulp.task('copy', function() {
    return gulp.src(['index.html', 'main.js', 'styles.css', 'header.html','*-*/*'])
        .pipe(gulp.dest('build'));
});

gulp.task('default', ['copy','deploy']);
