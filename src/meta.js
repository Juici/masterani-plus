'use strict';

const meta = {
    name: 'Masterani+',
    version: '0.3.1',
    author: 'Juici',
    description: 'Enhancements and additions to Masterani',
    icon: null,
    url: {
        homepage: 'https://github.com/Juici/masterani-plus',
        update: 'https://github.com/Juici/masterani-plus/raw/master/dist/ma-plus.meta.js',
        download: 'https://github.com/Juici/masterani-plus/raw/master/dist/ma-plus.user.js',
        support: 'https://github.com/Juici/masterani-plus',
    },
    page: {
        include: [
            /^https?:\/\/www\.masterani\.me\/.*/,
        ],
        match: [],
        exclude: [],
        connect: [
            'api.jikan.moe',
        ],
    },
    require: [],
    resource: [],
    runtime: 'document-start',
    grant: [
        'GM_xmlhttpRequest',
    ],
    noframes: false,
    unwrap: false,
};

module.exports = meta;
