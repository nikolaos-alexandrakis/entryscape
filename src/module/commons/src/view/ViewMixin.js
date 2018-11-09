import registry from 'commons/registry';
import declare from 'dojo/_base/declare';

/**
 * Check if there's a user sign-ed in.
 *
 * If overridden, follow the signature.
 *
 * @return {Promise}
 */
export default declare(null, {
  canShowView() {
    const userEntryInfo = registry.get('userInfo');
    const canShow = userEntryInfo != null && userEntryInfo.id !== '_guest';

    return new Promise(resolve => resolve(canShow));
  },
});
