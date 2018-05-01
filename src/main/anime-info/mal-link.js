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

function requestLink() {
    return http.request({
        url: search,
        method: 'GET',
        timeout: 5000,
    }).then(res => new Promise((resolve, reject) => {
        let result = JSON.parse(res.responseText);

        if (result.result && result.result[0]) {
            result = result.result[0];

            if (result.url) {
                resolve(result.url);
            }
        }

        reject();
    }));
}

requestLink().then(url => {
    if (document.readyState !== 'loading') {
        addLink(url);
    } else {
        document.addEventListener('DOMContentLoaded', () => addLink(url));
    }
});
