import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import Placeholder from './Placeholder';
/**
 * This implementation tries to get icon and name of entries by looking
 * at the surrounding view.
 */
export default declare([Placeholder], {
  constructor() {
    this.list = null;
  },

  postCreate() {
    const site = registry.getSiteManager();
    this.viewDef = site.getViewDef(site.getUpcomingOrCurrentView());
    if (this.viewDef && this.viewDef.faClass) {
      this.missingImageClass = this.viewDef.faClass;
    }
    this.inherited(arguments);
  },

  render() {
    this.includeCreateButton = this.list ? this.list.includeCreateButton === true : false;
    this.inherited(arguments);
  },

  getName() {
    const site = registry.getSiteManager();
    const viewDef = site.getViewDef(site.getUpcomingOrCurrentView());
    if (viewDef && viewDef.title) {
      return registry.get('localize')(viewDef.title);
    }

    return '';
  },

  getText() {
    if (!this.searchMode && this.list) {
      return this.list.getEmptyListWarning();
    }
    return '';
  },

  getNlsForCButton() {
    if (!this.searchMode && this.list) {
      return this.list.getNlsForCButton();
    }
    return {};
  },

  createAction() {
    this.list.openDialog('create', {});
  },
});
