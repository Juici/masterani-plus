const query = require('./query');

/**
 * Query the document with the given selector.
 *
 * @param selector {string} The query selector.
 * @returns {Promise<HTMLElement>}
 */
function q(selector) {
    return query(selector);
}

exports.q = q;
