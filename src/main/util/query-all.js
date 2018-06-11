class Watcher {
    constructor(query, cb) {
        this.query = query;
        this.cb = cb;
    }
}

class Observer {
    constructor() {
        this._config = {
            attributes: true,
            childList: true,
            subtree: true,
        };
        this._watchers = [];
        this._observer = new MutationObserver(mutations => this._observe(mutations));
        this._running = false;
    }

    _observe(mutations) {
        for (const mut of mutations) {
            for (const watcher of this._watchers) {
                if (mut.type === 'attributes' && mut.target.matches(watcher.query)) {
                    watcher.cb(mut.target);
                } else if (mut.type === 'childList') {
                    if (mut.addedNodes == null) {
                        continue;
                    }

                    for (const el of mut.addedNodes) {
                        if (typeof el.matches === 'function' && el.matches(watcher.query)) {
                            watcher.cb(el);
                        }
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

    add(watcher) {
        this._watchers.push(watcher);
    }
}

function queryAll(selector, callback) {
    const els = document.querySelectorAll(selector);
    for (const el of els) {
        callback(el);
    }

    observer.add(new Watcher(selector, callback));
}

const observer = new Observer();
observer.start();

module.exports = queryAll;
