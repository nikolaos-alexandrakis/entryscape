import Placeholder from './Placeholder';
import registry from '../registry';
import declare from 'dojo/_base/declare';

/**
 * This implementation tries to get icon and name of entries by looking at
 * the surrounding list.
 *
 * The list instance must be provided in the constructor as the list parameter,
 * it then uses the getName, getIconClass and getEmptyListWarning methods if they exists.
 */
export default declare([Placeholder], {
  constructor() {
    this.list = null;
  },
  postCreate() {
    const site = registry.getSiteManager();
    this.viewDef = site.getViewDef(site.getUpcomingOrCurrentView());
    if (this.list.getIconClass()) {
      this.missingImageClass = this.list.getIconClass();
    } else {
      this.missingImageClass = 'list';
    }
    this.inherited(arguments);
  },

  localeChange() {
    if (!this.searchMode) {
      const warning = this.list.getEmptyListWarning();
      if (warning) {
        this.setText(warning);
        const nlsObj = this.list.getNlsForCButton();
        this.setNlsForCButton(nlsObj);
        return;
      }
    }
    this.inherited(arguments);
  },

  render(searchMode) {
    this.includeCreateButton = this.list.includeCreateButton === true;
    this.inherited(arguments);
  },

  getName() {
    if (this.list.getName()) {
      const name = this.list.getName();
      if (name && name !== '') {
        return name;
      }
    }
    return '';
  },

  createAction() {
    this.list.openDialog('create', {});
  },
});
