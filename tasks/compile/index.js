'use strict';

const path = require('path');
const fs = require('fs');

const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const header = require('gulp-header');
const beautify = require('gulp-beautify');

const meta = require('./meta')(require('../../src/meta'));
const prelude = fs.readFileSync(paths.src.prelude, 'utf8').trim();

const beautifyOpts = {
    'indent_size': 4,
    'indent_char': ' ',
    'indent_with_tabs': false,
    'eol': '\n',
    'end_with_newline': true,
    'indent_level': 0,
    'preserve_newlines': true,
    'max_preserve_newlines': 2,
    'space_in_paren': false,
    'space_in_empty_paren': false,
    'jslint_happy': false,
    'space_after_anon_function': true,
    'brace_style': 'collapse,preserve-inline',
    'unindent_chained_methods': false,
    'break_chained_methods': false,
    'keep_array_indentation': false,
    'unescape_strings': true,
    'wrap_line_length': 0,
    'e4x': false,
    'comma_first': false,
    'operator_position': 'before-newline',
};

function userJs() {
    const b = browserify({
        entries: paths.src.entry,
        paths: [paths.src.main],
        prelude,
    });

    return b.bundle()
        .pipe(source(path.basename(paths.dest.userJs)))
        .pipe(buffer())
        .pipe(beautify(beautifyOpts))
        .pipe(header(meta + '\n'))
        .pipe(gulp.dest(paths.dest.dir));
}

function metaJs(done) {
    return fs.writeFile(paths.dest.metaJs, meta, 'utf8', done);
}

const index = gulp.parallel(userJs, metaJs);

module.exports = index;
