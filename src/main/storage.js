/**
 * A utility module for interfacing with the userscript storage.
 */
const storage = {
    /**
     * Remove an item from the storage.
     *
     * @param {string} key - The key of the item to remove.
     */
    remove(key) {
        GM_deleteValue(key);
    },

    /**
     * Gets the value of an item in the storage.
     *
     * @param {string} key - The key of the item.
     * @param {string|boolean|number} [def] - The default value if the item does not exist.
     *
     * @returns {string|boolean|number} The value of the item, the default value, or `null`.
     */
    get(key, def) {
        return GM_getValue(key, def);
    },

    /**
     * Set the value of an item in the storage.
     *
     * @param {string} key - The key of the item.
     * @param {string|boolean|number} value - The value of the item.
     */
    set(key, value) {
        GM_setValue(key, value);
    },
};

module.exports = storage;
