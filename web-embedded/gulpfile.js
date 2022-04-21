var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('default', function() {
  return gulp.src('./build/static/js/*.js')
    .pipe(concat('web-embedded.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
});