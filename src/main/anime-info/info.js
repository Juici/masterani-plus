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
