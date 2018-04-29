'use strict';

const gulp = require('gulp');
const del = require('del');
const mkdirp = require('make-dir');

function remove() {
    return del([`${paths.dest.dir}/**/*`]);
}

function mkdir() {
    return mkdirp(paths.dest.dir);
}

const clean = gulp.series(remove, mkdir);

module.exports = clean;
