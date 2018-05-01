const query = require('./query');

function q(selector) {
    return query(selector);
}

exports.q = q;
