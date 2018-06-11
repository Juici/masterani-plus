const _ = require('./util');

const blacklist = [
    '.campaign',
];

for (const sel of blacklist) {
    _.qa(sel, (el) => {
        const parent = el.parentElement;
        if (parent != null && parent.childElementCount === 1) {
            parent.remove();
        } else {
            el.remove();
        }
    });
}
