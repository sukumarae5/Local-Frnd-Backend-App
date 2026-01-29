const maleQueue = new Map();    // userId -> timestamp
const femaleQueue = new Map(); // userId -> timestamp

const MAX_WAIT_MS = 60_000; // 1 minute validity

function now() {
  return Date.now();
}

function cleanStale(queue) {
  const t = now();
  for (const [userId, at] of queue.entries()) {
    if (t - at > MAX_WAIT_MS) {
      queue.delete(userId);
    }
  }
}

module.exports = {
  /* ================= ADD USER ================= */
  add(userId, gender) {
    userId = String(userId);

    // remove from both queues first
    this.remove(userId);

    if (gender === "Male") {
      maleQueue.set(userId, now());
    }

    if (gender === "Female") {
      femaleQueue.set(userId, now());
    }
  },

  /* ================= REMOVE USER ================= */
  remove(userId) {
    userId = String(userId);
    maleQueue.delete(userId);
    femaleQueue.delete(userId);
  },

  /* ================= POP OPPOSITE ================= */
  popOpposite(gender) {
    // clean old entries first
    cleanStale(maleQueue);
    cleanStale(femaleQueue);

    if (gender === "Male") {
      // male wants female
      const entry = femaleQueue.entries().next().value;
      if (!entry) return null;

      const [femaleId] = entry;
      femaleQueue.delete(femaleId);
      return femaleId;
    }

    if (gender === "Female") {
      // female wants male
      const entry = maleQueue.entries().next().value;
      if (!entry) return null;

      const [maleId] = entry;
      maleQueue.delete(maleId);
      return maleId;
    }

    return null;
  },

  snapshot() {
    return {
      male: [...maleQueue.keys()],
      female: [...femaleQueue.keys()],
    };
  },
};
