const http = require('../http');
const info = require('./info');

const search = `https://api.jikan.moe/search/anime/${global.encodeURIComponent(info.anime.title)}`;

function addLink(url) {
    // const details = global.document.getElementById('details');
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
