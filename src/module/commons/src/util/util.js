/* eslint-disable import/prefer-default-export */
import isUrl from 'is-url';
import { mergeWith } from 'lodash-es';
import m from 'mithril';

export const isUri = stringToCheck => isUrl(stringToCheck);

/* eslint-disable */
/**
 * Customizer functions to avoid merging arrays in objects, rather we should replace them
 *
 * @see https://lodash.com/docs/4.17.11#mergeWith
 * @param objValue
 * @param srcValue
 * @return {undefined|Array}
 */
const replaceArraysCustomizer = (objValue, srcValue) => {
  if (Array.isArray(objValue)) {
    return srcValue;
  }

  // returns undefined otherwise which is a trigger for the mergeWith to apply a default merge
};
/* eslint-enable */

/**
 * Returns a function for setting a closed "state" object
 * @param {object} state
 *
 *
 * @returns {function}
 */
export const createSetState = state => (props, avoidRedraw = false) => {
  mergeWith(state, props, replaceArraysCustomizer);
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
export const convertBytesToMBytes = bytes => Number(parseFloat(bytes / 1048576).toFixed(2)); // convert bytes to Mb
