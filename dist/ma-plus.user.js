// ==UserScript==
// @name         Masterani+
// @namespace    https://github.com/Juici/masterani-plus
// @version      0.3.0
// @author       Juici
// @description  Enhancements and additions to Masterani
// @homepageURL  https://github.com/Juici/masterani-plus
// @updateURL    https://github.com/Juici/masterani-plus/raw/master/dist/ma-plus.meta.js
// @downloadURL  https://github.com/Juici/masterani-plus/raw/master/dist/ma-plus.user.js
// @supportURL   https://github.com/Juici/masterani-plus
// @include      /^https?:\/\/www\.masterani\.me\/.*/
// @connect      api.jikan.moe
// @run-at       document-start
// @grant        GM_xmlhttpRequest
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
            anime.description = description ? description : '';

            info.anime = anime;
        } else {
            info.matches = false;
        }

        module.exports = info;

    }, {}],
    3: [function (require, module, exports) {
        const http = require('../http');
        const info = require('./info');
        const _ = require('../util');

        const search = `https://api.jikan.moe/search/anime/${encodeURIComponent(info.anime.title)}`;

        function addLink(url) {
            _.q('.ui.sections.list').then(sections => {
                const link = document.createElement('a');
                link.className = 'item';
                link.href = url;
                link.target = '_blank';
                link.innerText = 'MyAnimeList';

                sections.appendChild(link);
            });
        }

        http.request({
            url: search,
            method: 'GET',
            timeout: 5000,
        }).then(res => {
            let result = JSON.parse(res.responseText);
            result = result.result[0];

            if (document.readyState !== 'loading') {
                addLink(result.url);
            } else {
                document.addEventListener('DOMContentLoaded', () => addLink(result.url));
            }
        });

    }, { "../http": 4, "../util": 6, "./info": 2 }],
    4: [function (require, module, exports) {
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
    5: [function (require, module, exports) {
        const start = window.performance.now();

        // load modules
        require('./anime-info');

        const end = window.performance.now();

        // finished loading
        const info = GM_info.script;
        console.log(`${info.name} ${info.version} loaded in ${end - start}ms!`);

    }, { "./anime-info": 1 }],
    6: [function (require, module, exports) {
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

    }, {}]
}, {}, [5]);
