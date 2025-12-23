const groupCache = {
  data: {},
  ttl: 5 * 60 * 1000,

  set(key, value) {
    this.data[key] = {
      value,
      expire: Date.now() + this.ttl
    };
  },

  get(key) {
    const item = this.data[key];
    if (!item) return null;
    if (Date.now() > item.expire) {
      delete this.data[key];
      return null;
    }
    return item.value;
  },

  delete(key) {
    delete this.data[key];
  }
};

module.exports = { groupCache };
