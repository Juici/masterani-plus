const regex = /^https?:\/\/www\.masterani\.me\/anime\/info\/((\d+)-.*)[?#]?/i;
const matches = regex.exec(window.location.href);

module.exports = {
    matches: matches != null,
    anime: {
        id: matches[2],
        slug: matches[1],
        title: window.args.anime.title,
    },
};
