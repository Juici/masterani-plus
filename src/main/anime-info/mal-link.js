const http = require('../http');
const info = require('./info');

const search = `https://api.jikan.moe/search/anime/${encodeURIComponent(info.anime.title)}`;

function addLink(url) {
    const sections = document.querySelector('.ui.sections.list');

    const link = document.createElement('a');
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

    if (document.readyState !== 'loading') {
        addLink(result.url);
    } else {
        document.addEventListener('DOMContentLoaded', () => addLink(result.url));
    }
});
