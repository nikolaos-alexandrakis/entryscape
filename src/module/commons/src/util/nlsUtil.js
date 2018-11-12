/* eslint-disable import/prefer-default-export */
export const getLocalizedValue = (key, generic, specific) => (specific && specific[key]) || generic[key] || '';

