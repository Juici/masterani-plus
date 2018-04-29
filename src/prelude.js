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
})()
