const normalize = (a, b) => {
  return a < b ? { u1: a, u2: b } : { u1: b, u2: a };
};

module.exports = normalize;
