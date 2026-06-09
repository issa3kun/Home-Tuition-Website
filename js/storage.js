const StorageManager = {
  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  add(key, item) {
    const currentData = this.get(key);
    currentData.push(item);
    this.save(key, currentData);
  }
};

function generateJobId() {
  const timestamp = Date.now().toString().slice(-6);
  const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `HTJ-${timestamp}-${randomCode}`;
}