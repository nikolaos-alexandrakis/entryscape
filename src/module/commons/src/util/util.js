/* eslint-disable import/prefer-default-export */
import isUrl from 'is-url';
import m from 'mithril';

export const isUri = stringToCheck => isUrl(stringToCheck);

/**
 * Returns a function for setting a closed "state" object
 * @param {object} state
 *
 *
 * @returns {function}
 */
export const createSetState = state => (props, avoidRedraw = false) => {
  Object.entries(props).forEach((keyVal) => {
    state[keyVal[0]] = keyVal[1];
  });

  if (!avoidRedraw) {
    m.redraw();
  }

  return state;
};

export const isExternalLink = (url) => {
  const anchor = document.createElement('a');
  anchor.href = url;

  // Check empty hostname for IE11
  if (anchor.hostname === '') {
    return false;
  }

  return anchor.hostname !== window.location.hostname;
};

/**
 * Converts bytes to mega bytes.
 * NOTE! there is no sanity check for the give param 'bytes'
 * @param {number} bytes
 * @return {number}
 */
export const convertBytesToMBytes = bytes => Number.parseFloat(bytes / 1048576); // convert bytes to Mb
