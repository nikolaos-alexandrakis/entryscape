/* eslint-disable import/prefer-default-export */
import isUrl from 'is-url';
import m from 'mithril';

export const isUri = stringToCheck => isUrl(stringToCheck);

export const createSetState = state => (props, redraw = false) => {
  Object.entries(props).forEach((keyVal) => {
    state[keyVal[0]] = keyVal[1];
  });
  if (redraw) {
    m.redraw();
  }

  return state;
};
