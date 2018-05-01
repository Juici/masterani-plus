'use strict';

const gulp = require('gulp');

const paths = {
    src: {
        dir: './src',
        prelude: './src/prelude.js',
        header: './src/meta.js',
        main: './src/main',
        entry: './src/main/loader.js',
    },
    dest: {
        dir: './dist',
        metaJs: './dist/ma-plus.meta.js',
        userJs: './dist/ma-plus.user.js',
    },
};
global.paths = paths;

const { lint, test } = require('./tasks/test');
const clean = require('./tasks/clean');
const js = require('./tasks/compile');

exports.lint = lint;
exports.test = test;
exports.clean = clean;
exports.js = js;

const build = gulp.series(test, clean, js);

exports.build = build;
exports.default = build;
