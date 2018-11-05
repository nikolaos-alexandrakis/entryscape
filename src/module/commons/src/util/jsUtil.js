// TODO we can use lodash now
export default {
  isShallowEqual(a, b) {
    if (a === b) return true
    for (var i in a) if (!(i in b)) return false
    for (var i in b) if (a[i] !== b[i]) return false
    return true
  }
};
