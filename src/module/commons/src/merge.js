/**
 * Deep merge of two objects or concatenation of arrays.
 * If two objects are given the latter values are merged into te first object.
 * If there are subobjects the procedure are repeated for those.
 * If a key is prefixed with a ! the value is overwritten rather than merged.
 */
const merge = (o1, o2) => {
  if (o1 instanceof Array && o2 instanceof Array) {
    return o1.concat(o2);
  } else if (typeof o1 === 'object' && typeof o2 === 'object' && o1 !== null && o2 !== null) {
    Object.keys(o2).forEach((key2) => {
      if (key2[0] === '!') {
        let nkey2 = key2;
        nkey2 = nkey2.substr(1);
        o1[nkey2] = o2[`!${nkey2}`];
      } else if (!o1.hasOwnProperty(key2)) {
        o1[key2] = o2[key2];
      } else {
        o1[key2] = merge(o1[key2], o2[key2]);
      }
    });
    return o1;
  }
  return o2;
};

const mergeConfig = (...args) => {
  const l = args.length;
  let o = args[0];
  let i = 1;
  for (; i < l; i++) {
    o = merge(o, args[i]);
  }
  return o;
};


export {mergeConfig};
export default mergeConfig;
