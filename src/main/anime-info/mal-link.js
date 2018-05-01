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
