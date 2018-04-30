// ==UserScript==
// @name         Masterani+
// @namespace    https://github.com/Juici/masterani-plus
// @version      0.2.0
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
        (function (global) {
            const regex = /^https?:\/\/www\.masterani\.me\/anime\/info\/((\d+)-.*)[?#]?/i;

            const info = {};

            const matches = regex.exec(global.location.href);
            if (matches) {
                info.matches = true;

                const anime = {};
                anime.id = matches[2];
                anime.slug = matches[1];

                let title = global.document.querySelector('meta[property="og:title"]');
                anime.title = title ? title.content.replace(' - Masterani', '') : '';

                let description = global.document.querySelector('meta[property="og:title"]');
                anime.description = description ? description : '';

                info.anime = anime;
            } else {
                info.matches = false;
            }

            module.exports = info;

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    3: [function (require, module, exports) {
        (function (global) {
            const http = require('../http');
            const info = require('./info');

            const search = `https://api.jikan.moe/search/anime/${global.encodeURIComponent(info.anime.title)}`;

            function addLink(url) {
                const sections = global.document.querySelector('.ui.sections.list');

                const link = global.document.createElement('a');
                link.className = 'item';
                link.href = url;
                link.target = '_blank';
                link.innerText = 'MyAnimeList';

                sections.appendChild(link);
            }

            http.request({
                url: search,
                method: 'GET',
                timeout: 5000,
            }).then(res => {
                let result = JSON.parse(res.responseText);
                result = result.result[0];

                if (global.document.readyState !== 'loading') {
                    addLink(result.url);
                } else {
                    global.document.addEventListener('DOMContentLoaded', () => addLink(result.url));
                }
            });

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, { "../http": 4, "./info": 2 }],
    4: [function (require, module, exports) {
        (function (global) {
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

                return new global.Promise((resolve, reject) => {
                    opts.onload = function (res) {
                        resolve(res);
                    };
                    opts.onabort = opts.onerror = opts.ontimeout = function (res) {
                        reject(res);
                    };
                    GM_xmlhttpRequest(opts);
                });
            };

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    5: [function (require, module, exports) {
        // load modules
        require('./anime-info');

        // finished loading
        const info = GM_info.script;
        console.log(`${info.name} ${info.version} loaded!`);

    }, { "./anime-info": 1 }]
}, {}, [5]);
