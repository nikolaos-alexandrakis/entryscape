/**
 * TODO check if still used and if so, can we use lodash?
 */

/**
 * Remove all keys in params that are not in viewParams.
 *
 * @param viewParams
 * @param params
 * @return {Object}
 */
const clearParams = (viewParams, params) => {
  Object.keys(params).forEach((key) => {
    if (!viewParams.has(key)) {
      delete params[key];
    }
  });

  return params;
};

/**
 * Clean any stale params, e.g from old view, and add new specific params, e.g for the current
 * view
 *
 * @param viewParams
 * @param currentParams
 * @param newSpecificParams
 * @return {Object}
 */
const constructParams = (viewParams, currentParams, newSpecificParams) => {
  const cleanParams = clearParams(viewParams, currentParams);
  return Object.assign(cleanParams, newSpecificParams);
};


export default {
  clearParams,
  constructParams,
};

