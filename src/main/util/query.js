class PendingQuery {
    constructor(query, resolve) {
        this.query = query;
        this.resolve = resolve;
    }
}

class Observer {
    constructor() {
        this._config = {
            attributes: true,
            childList: true,
            subtree: true,
        };
        this._pending = [];
        this._observer = new MutationObserver(mutations => this._observe(mutations));
        this._running = false;
    }

    _observe(mutations) {
        for (const mut of mutations) {
            let i = this._pending.length;
            while (i--) {
                let query = this._pending[i];

                if (mut.type === 'attributes' && mut.target.matches(query.query)) {
                    this._pending.slice(i, 1);
                    query.resolve(mut.target);
                } else if (mut.type === 'childList') {
                    const el = mut.target.querySelector(query.query);
                    if (el != null) {
                        this._pending.slice(i, 1);
                        query.resolve(el);
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
        this._pending.push(pending);
    }
}

function query(selector) {
    return new Promise(resolve => {
        let el = document.querySelector(selector);
        if (el != null) {
            resolve(el);
        } else {
            const pending = new PendingQuery(selector, resolve);
            observer.add(pending);
        }
    });
}

const observer = new Observer();
observer.start();

module.exports = query;
