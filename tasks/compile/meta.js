'use strict';

function hashUrl(url, hashes) {
    let hashString = '';

    for (let hash in hashes) {
        if (hashes.hasOwnProperty(hash)) {
            if (hashString.length === 0) {
                hashString = '#';
            } else {
                hashString += ',';
            }
            hashString += `${hash}=${hashes[hash]}`;
        }
    }

    return url + hashString;
}

function buildEntries(meta) {
    const entries = [];

    entries.push({ 'name': meta.name });
    entries.push({ 'namespace': meta.url.homepage });
    entries.push({ 'version': meta.version });
    entries.push({ 'author': meta.author });
    entries.push({ 'description': meta.description });

    if (typeof meta.icon === 'string' && meta.icon) {
        entries.push({ 'icon': meta.icon });
    }

    entries.push({ 'homepageURL': meta.url.homepage });
    entries.push({ 'updateURL': meta.url.update });
    entries.push({ 'downloadURL': meta.url.download });
    entries.push({ 'supportURL': meta.url.support });

    for (let url of meta.page.include) {
        entries.push({ 'include': url.toString() });
    }
    for (let url of meta.page.match) {
        entries.push({ 'match': url.toString() });
    }
    for (let url of meta.page.exclude) {
        entries.push({ 'exclude': url.toString() });
    }

    for (let req of meta.require) {
        entries.push({ 'require': hashUrl(req.url, req.hashes || {}) });
    }
    for (let res of meta.resource) {
        entries.push({ 'resource': `${res.name} ${hashUrl(res.url, res.hashes || {})}` });
    }

    for (let url of meta.page.connect) {
        entries.push({ 'connect': url.toString() });
    }

    entries.push({ 'run-at': meta.runtime });

    for (let grant of meta.grant) {
        entries.push({ 'grant': grant });
    }

    if (meta.noframes) {
        entries.push({ 'noframes': '' });
    }
    if (meta.unwrap) {
        entries.push({ 'unwrap': '' });
    }

    return entries;
}

function getLongestTag(entries) {
    let len = 0;

    for (let entry of entries) {
        for (let tag in entry) {
            if (entry.hasOwnProperty(tag) && tag.length > len) {
                len = tag.length;
            }
        }
    }

    return len;
}

function padSpace(len) {
    let pad = '';
    for (let i = 0; i < len; i++) {
        pad += ' ';
    }

    return pad;
}

function build(meta) {
    const entries = buildEntries(meta);
    const len = getLongestTag(entries);

    // block
    let block = [];

    block.push('// ==UserScript==');

    for (let entry of entries) {
        for (let tag in entry) {
            if (entry.hasOwnProperty(tag)) {
                const pad = padSpace(len - tag.length);
                block.push(`// @${tag + pad}  ${entry[tag]}`.trim());
            }
        }
    }

    block.push('// ==/UserScript==');

    return block.join('\n') + '\n';
}

module.exports = build;
