/* eslint-disable import/prefer-default-export */
import m from 'mithril';
import isUrl from 'is-url';

export const isUri = stringToCheck => isUrl(stringToCheck);

export const createSetState = state => (props, redraw = false) => {
  Object.entries().forEach(keyVal => state[keyVal[0]] = keyVal[1]);
  if (redraw) {
    m.redraw();
  }

  return state;
};
