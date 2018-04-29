module.exports = {
    'env': {
        'node': true,
        'es6': true,
    },
    'extends': 'eslint:recommended',
    'rules': {
        // errors
        'indent': [2, 4],
        'linebreak-style': [2, 'unix'],
        'quotes': [2, 'single'],
        'semi': [2, 'always'],

        // overrides
        'no-console': 0,
    },
};
