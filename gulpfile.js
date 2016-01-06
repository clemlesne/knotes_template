'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var compass = require('gulp-compass');
var imagemin = require('gulp-imagemin');
var nano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var ncp = require('ncp').ncp;

var paths = {
  app: 'app',
  scripts: 'app/js',
  scripts_test: 'app/js/**/*.js',
  scripts_test_compile: {
    'top.js' : [ 'app/js/vendor/modernizr-2.8.3-respond-1.4.2.min.js' ],
    'bottom.js' : [ 'app/js/vendor/pnotify.custom.min.js', 'app/js/vendor/codemirror.min.js', 'app/js/vendor/jquery.panel.js', 'app/js/vendor/highlight.pack.js', 'app/js/main.js' ]
  },
  scripts_dist: 'dist/js',
  images: 'app/img',
  images_test: 'app/img/**/*',
  images_dist: 'dist/img',
  sass: 'app/scss',
  sass_test: 'app/scss/**/*.scss',
  sass_dist: 'dist/css',
  font: 'app/font',
  font_dist: 'dist/font',
  font_test: 'app/font/**/*',
  dist: 'dist',
  dist_test: 'dist/**/*',
  dist_copy: '../knotes/public'
};


gulp.task('scripts', function() {
  for(var key in paths.scripts_test_compile) {
    gulp.src(paths.scripts_test_compile[key])
      .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat(key))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(paths.scripts_dist));
  }
});

gulp.task('images', function() {
  return gulp.src(paths.images_test)
    .pipe(imagemin({optimizationLevel: 7}))
    .pipe(gulp.dest(paths.images_dist));
});

gulp.task('sass', function() {
  return gulp.src(paths.sass_test)
    .pipe(compass({
      project: __dirname,
      css: paths.sass_dist,
      sass: paths.sass
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['> 1%', 'IE 7'],
      cascade: true
    }))
    .pipe(nano())
    .pipe(gulp.dest(paths.sass_dist));
});

gulp.task('font', function() {
  return gulp.src(paths.font_test)
    .pipe(gulp.dest(paths.font_dist));
});

gulp.task('watch', function () {
  gulp.watch(paths.scripts_test, ['scripts', 'knotes']);
  gulp.watch(paths.images_test, ['images', 'knotes']);
  gulp.watch(paths.font_test, ['font', 'knotes']);
  gulp.watch(paths.sass_test, ['sass', 'knotes']);
});

gulp.task('knotes', function() {
  ncp(paths.dist, paths.dist_copy, function(err) {
    if(err) {
      return console.error(err);
    }
    console.log('Done kNote project update !');
  });
});

gulp.task('default', ['watch', 'scripts', 'images', 'font', 'sass', 'knotes']);
