import gulp from 'gulp';
import ghPages from 'gulp-gh-pages';
import jspm from 'jspm';

//var watch = require('gulp-watch');

const dist = 'build';

gulp.task('bundle', (done) => {
  jspm.setPackagePath('.');
  jspm.bundleSFX('src/index', dist + '/main.js', {
    sourceMaps: false,
    minify: true,
    mangle: true,
    separateCSS: true,
  })
  .then(() => {
    done();
  })
  .catch( (e) => console.log(e));
});

gulp.task('deploy', () => {
  return gulp.src(dist + '/**/*')
      .pipe(ghPages());
});

gulp.task('copy', function() {
    return gulp.src(['*-*/*.html','*-*/*.js'])		
        .pipe(gulp.dest('build'));
});

gulp.task('copyback', function() {
    return gulp.src(['./build/*-*/*.html','./build/*-*/*.js'])		
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['copy','deploy']);

