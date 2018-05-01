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
