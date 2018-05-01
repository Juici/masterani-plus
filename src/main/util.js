// Internal

/**
 * A pending query with callback.
 */
class PendingQuery {
    constructor(query, resolve) {
        this.query = query;
        this.resolve = resolve;
    }
}

/**
 * A global MutationObserver to resolve pending queries.
 */
class Observer {
    constructor() {
        this._config = {
            attributes: true,
            childList: true,
            subtree: true,
        };
        this._queries = [];
        this._observer = new MutationObserver(mutations => this._observe(mutations));
        this._running = false;
    }

    _observe(mutations) {
        for (let mut of mutations) {
            let i = this._queries.length;
            while (i--) {
                let pending = this._queries[i];

                if (mut.type === 'attributes' && mut.target.matches(pending.query)) {
                    this._queries.slice(i, 1);
                    pending.resolve(mut.target);
                } else if (mut.type === 'childList') {
                    const el = mut.target.querySelector(pending.query);
                    if (el != null) {
                        this._queries.slice(i, 1);
                        pending.resolve(el);
                    }
                }
            }
        }
    }

    start() {
        if (this._running) {
            return;
        }
        this._observer.observe(document.documentElement, this._config);
        this._running = true;
    }

    stop() {
        if (!this._running) {
            return;
        }
        this._observer.disconnect();
        this._running = false;
    }

    add(pending) {
        this._queries.push(pending);
    }
}

const observer = new Observer();
observer.start();

// External

function q(query) {
    return new Promise(resolve => {
        let el = document.querySelector(query);
        if (el != null) {
            resolve(el);
        } else {
            const pending = new PendingQuery(query, resolve);
            observer.add(pending);
        }
    });
}

exports.q = q;
