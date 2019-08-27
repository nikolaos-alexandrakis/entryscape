const emptyFunction = () => {
};

/**
 * Provide a generic workflow to handle pagination actions. Two steps:
 *
 * - set the newPage as the state value (via setState) of stateItems
 * - run and return a callback function
 *
 * @param newPage
 * @param setState
 * @param stateItems
 * @param callback
 * @return {*}
 */
const paginationHandler = (newPage, stateItems, setState, callback = emptyFunction) => {
  const items = Array.isArray(stateItems) ? stateItems : [stateItems];

  const newState = {};
  items.forEach((item) => {
    newState[item] = newPage;
  });
  setState(newState);

  return callback();
};

export {
  paginationHandler,
};
