/* eslint-disable import/prefer-default-export */
import m from 'mithril';
import isUrl from 'is-url';

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
