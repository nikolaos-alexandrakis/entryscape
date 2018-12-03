/* eslint-disable import/prefer-default-export */
import m from 'mithril';
import isUrl from 'is-url';

export const isUri = stringToCheck => isUrl(stringToCheck);

export const createSetState = state => (props, redraw = false) => {
  const newState = { ...state, ...props };
  if (redraw) {
    m.redraw();
  }

  return newState;
};
