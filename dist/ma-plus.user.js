// ==UserScript==
// @name         Masterani+
// @namespace    https://github.com/Juici/masterani-plus
// @version      0.5.0
// @author       Juici
// @description  Enhancements and additions to Masterani
// @copyright    2018, Juici (https://github.com/Juici/masterani-plus)
// @license      MIT; https://github.com/Juici/masterani-plus/raw/master/LICENSE
// @homepageURL  https://github.com/Juici/masterani-plus
// @updateURL    https://github.com/Juici/masterani-plus/raw/master/dist/ma-plus.meta.js
// @downloadURL  https://github.com/Juici/masterani-plus/raw/master/dist/ma-plus.user.js
// @supportURL   https://github.com/Juici/masterani-plus
// @include      /^https?:\/\/www\.masterani\.me\/.*/
// @connect      api.jikan.moe
// @connect      myanimelist.net
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    function outer(modules, cache, entry) {
        const previousRequire = typeof require === 'function' && require;

        function newRequire(name, jumped) {
            if (!cache[name]) {
                if (!modules[name]) {
                    const currentRequire = typeof require === 'function' && require;
                    if (!jumped && currentRequire) {
                        return currentRequire(name, true);
                    }
                    if (previousRequire) {
                        return previousRequire(name, true);
                    }

                    const err = new Error('Cannot find module \'' + name + '\'');
                    err.code = 'MODULE_NOT_FOUND';
                    throw err;
                }

                const m = cache[name] = { exports: {} };
                modules[name][0].call(m.exports, function (x) {
                    const id = modules[name][1][x];
                    return newRequire(id ? id : x);
                }, m, m.exports, outer, modules, cache, entry);
            }
            return cache[name].exports;
        }

        for (let i = 0; i < entry.length; i++) {
            newRequire(entry[i]);
        }

        return newRequire;
    }

    return outer;
})()({
    1: [function (require, module, exports) {
        const { matches } = require('./info');

        if (!matches) {
            return;
        }

        require('./mal-link');

    }, { "./info": 2, "./mal-link": 3 }],
    2: [function (require, module, exports) {
        const regex = /^https?:\/\/www\.masterani\.me\/anime\/info\/((\d+)-.*)[?#]?/i;

        const info = {};

        const matches = regex.exec(window.location.href);
        if (matches) {
            info.matches = true;

            const anime = {};
            anime.id = matches[2];
            anime.slug = matches[1];

            let title = document.querySelector('meta[property="og:title"]');
            anime.title = title ? title.content.replace(' - Masterani', '') : '';

            let description = document.querySelector('meta[property="og:title"]');
            anime.description = description ? description.context : '';

            info.anime = anime;
        } else {
            info.matches = false;
        }

        module.exports = info;

    }, {}],
    3: [function (require, module, exports) {
        const http = require('../http');
        const storage = require('../storage');
        const { anime } = require('./info');
        const _ = require('../util');

        const search = `https://myanimelist.net/anime.php?q=${encodeURIComponent(anime.title)}`;
        const result = /<a[^>]*?class="[^"]*?\bhoverinfo_trigger\b[^"]*?"[^>]*?href="https?:\/\/myanimelist\.net\/anime\/(\d+)\/[^"]*?"[^>]*?>/i;

        const linker = {
            _add(id) {
                _.q('.ui.sections.list').then(sections => {
                    const link = document.createElement('a');
                    link.className = 'item';
                    link.href = `https://myanimelist.net/anime/${id}`;
                    link.target = '_blank';
                    link.innerText = 'MyAnimeList';

                    sections.appendChild(link);
                });
            },

            add(id) {
                if (document.readyState !== 'loading') {
                    this._add(id);
                } else {
                    document.addEventListener('DOMContentLoaded', () => this._add(id));
                }
            },

            request() {
                return http.request({
                    url: search,
                    method: 'GET',
                }).then(res => new Promise((resolve, reject) => {
                    const page = res.responseText;
                    const match = result.exec(page);

                    if (match) {
                        resolve(match[1]);
                    } else {
                        reject();
                    }
                }));
            },
        };

        const cache = JSON.parse(storage.get('cache', '{}'));

        let id = cache[anime.id];
        if (id != null) {
            linker.add(id);
        } else {
            linker.request().then(id => {
                cache[anime.id] = id;
                storage.set('cache', JSON.stringify(cache));

                linker.add(id);
            });
        }

    }, { "../http": 5, "../storage": 7, "../util": 8, "./info": 2 }],
    4: [function (require, module, exports) {
        const _ = require('./util');

        const blacklist = [
            '.campaign',
        ];

        for (const sel of blacklist) {
            _.qa(sel, (el) => {
                const parent = el.parentElement;
                if (parent != null && parent.childElementCount === 1) {
                    parent.remove();
                } else {
                    el.remove();
                }
            });
        }

    }, { "./util": 8 }],
    5: [function (require, module, exports) {
        exports.request = function (url, init) {
            const opts = {};

            if (typeof url === 'string') {
                init = init || {};
            } else if (typeof url === 'object') {
                init = url;
                url = init.url || '';
            }

            opts.url = url;

            opts.method = (init.method || 'GET').toUpperCase();
            opts.headers = init.headers || {};

            if (init.data) {
                opts.data = init.data;
            }
            if (init.timeout) {
                opts.timeout = init.timeout;
            }
            if (init.username && init.password) {
                opts.username = init.username;
                opts.password = init.password;
            }

            return new Promise((resolve, reject) => {
                opts.onload = function (res) {
                    resolve(res);
                };
                opts.onabort = opts.onerror = opts.ontimeout = function (res) {
                    reject(res);
                };
                GM_xmlhttpRequest(opts);
            });
        };

    }, {}],
    6: [function (require, module, exports) {
        const start = window.performance.now();

        // load modules
        require('./anime-info');
        require('./cleaner');

        const end = window.performance.now();

        // finished loading
        const info = GM_info.script;
        console.log(`${info.name} ${info.version} loaded in ${end - start}ms!`);

    }, { "./anime-info": 1, "./cleaner": 4 }],
    7: [function (require, module, exports) {
        /**
         * A utility module for interfacing with the userscript storage.
         */
        const storage = {
            /**
             * Remove an item from the storage.
             *
             * @param {string} key - The key of the item to remove.
             */
            remove(key) {
                GM_deleteValue(key);
            },

            /**
             * Gets the value of an item in the storage.
             *
             * @param {string} key - The key of the item.
             * @param {string|boolean|number} [def] - The default value if the item does not exist.
             *
             * @returns {string|boolean|number} The value of the item, the default value, or `null`.
             */
            get(key, def) {
                return GM_getValue(key, def);
            },

            /**
             * Set the value of an item in the storage.
             *
             * @param {string} key - The key of the item.
             * @param {string|boolean|number} value - The value of the item.
             */
            set(key, value) {
                GM_setValue(key, value);
            },
        };

        module.exports = storage;

    }, {}],
    8: [function (require, module, exports) {
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

    }, { "./query": 10, "./query-all": 9 }],
    9: [function (require, module, exports) {
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

                                if (typeof el.querySelectorAll === 'function') {
                                    const children = el.querySelectorAll(watcher.query);
                                    for (const child of children) {
                                        watcher.cb(child);
                                    }
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

    }, {}],
    10: [function (require, module, exports) {
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

    }, {}]
}, {}, [6]);
