const getLocalizedValue = (key, generic, specific) => (specific && specific[key]) || generic[key] || '';

export {
  getLocalizedValue,
};

