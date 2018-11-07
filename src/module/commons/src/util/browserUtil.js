/**
 * Returns an object from a hash string like that provided by
 * window.location.search
 *
 * @param {string} hashString
 * @returns {object}
 */
export const queryToObject = (hashString) =>
  hashString
    .replace('?','')
    .split('&')
    .map( keyVal => keyVal.split('=') )
    .reduce(
      (accum, keyValPair) => {
        if(keyValPair[0]) {
          accum[keyValPair[0]] = keyValPair[1];
        }
        return accum;
      },
      {}
    );

/**
 * Creates an has string useable in a url from an object
 *
 * @param {object} queryObject An object of keys and values
 * @returns {string}
 */
export const objectToQuery = (queryObject) =>
  Object.keys(queryObject)
    .map( key => `${key}=${queryObject[key]}`)
    .reduce(
      (accum, keyValString, i) => i > 0 ? `${accum}&${keyValString}` : keyValString,
      ''
    );
