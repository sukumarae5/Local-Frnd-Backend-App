const queue = [];

module.exports = {
  add(userId) {
    if (!queue.includes(userId)) queue.push(userId);
  },
  remove(userId) {
    const i = queue.indexOf(userId);
    if (i !== -1) queue.splice(i, 1);
  },
  pop() {
    return queue.shift(); // FIFO
  },
  list() {
    return queue;
  }
};
