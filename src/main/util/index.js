const query = require('./query');
const queryAll = require('./query-all');

/**
 * Query the document with the given selector.
 *
 * @param {string} selector - The query selector.
 * @returns {Promise<HTMLElement>}
 */
function q(selector) {
    return query(selector);
}

/**
 * Query the document with the given selector and perform the callback function on any new element
 * matches.
 *
 * @param {string} selector - The query selector.
 * @param {function(HTMLElement)} callback - The callback function.
 */
function qa(selector, callback) {
    queryAll(selector, callback);
}

exports.q = q;
exports.qa = qa;
