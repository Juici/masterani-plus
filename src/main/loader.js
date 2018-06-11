const start = window.performance.now();

// load modules
require('./anime-info');
require('./cleaner');

const end = window.performance.now();

// finished loading
const info = GM_info.script;
console.log(`${info.name} ${info.version} loaded in ${end - start}ms!`);
