import declare from 'dojo/_base/declare';

/**
 * Provide a simple function that is checked in spa.
 * @return {Promise}
 */
export default declare(null, {
  canShowView() {
    return Promise.resolve(true);
  },
});
