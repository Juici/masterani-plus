'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');

function lint() {
    return gulp.src(paths.src.dir)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

exports.lint = lint;

const test = gulp.series(lint);

exports.test = test;
