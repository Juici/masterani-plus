const http = require('../http');
const info = require('./info');
const _ = require('../util');

const search = `https://myanimelist.net/anime.php?q=${encodeURIComponent(info.anime.title)}`;
const findUrl = /<a[^>]*?class="[^"]*?\bhoverinfo_trigger\b[^"]*?"[^>]*?href="([^"]*?)"[^>]*?>/i;

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

function requestLink() {
    return http.request({
        url: search,
        method: 'GET',
        timeout: 5000,
    }).then(res => new Promise((resolve, reject) => {
        const page = res.responseText;
        const match = findUrl.exec(page);

        if (match) {
            resolve(match[1]);
        } else {
            reject();
        }
    }));
}

requestLink().then(url => {
    if (document.readyState !== 'loading') {
        addLink(url);
    } else {
        document.addEventListener('DOMContentLoaded', () => addLink(url));
    }
});
