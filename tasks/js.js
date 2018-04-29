'use strict';

const path = require('path');
const fs = require('fs');

const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const header = require('gulp-header');
const beautify = require('gulp-beautify');

const prelude = fs.readFileSync(paths.src.prelude, 'utf8').trim();

const beautifyOpts = {
    'indent_size': 4,
    'indent_char': ' ',
    'indent_with_tabs': false,
    'eol': '\n',
    'end_with_newline': true,
    'indent_level': 0,
    'preserve_newlines': true,
    'max_preserve_newlines': 1,
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

function js() {
    const b = browserify({
        entries: paths.src.entry,
        paths: [paths.src.main],
        prelude,
    });

    return b.bundle()
        .pipe(source(path.basename(paths.dest.file)))
        .pipe(buffer())
        .pipe(beautify(beautifyOpts))
        .pipe(header(fs.readFileSync(paths.src.header, 'utf8') + '\n'))
        .pipe(gulp.dest(paths.dest.dir));
}

module.exports = js;
