import registry from '../../registry';
import utils from '../utils';
import MenuList from './menu/MenuList';
import {NLSMixin} from 'esi18n';
import escoModules from 'commons/nls/escoModules.nls';
import m from 'mithril';
import declare from 'dojo/_base/declare';

/**
 * Helper function to get the module title
 * @param {Object} module
 * @param {Object} bundle
 * @return {String}
 */
const getLocalizedModuleTitle = (module, bundle) => {
  if (module.productName && bundle) {
    const productNameTranslated = utils.getModuleProp(module, bundle, 'title');
    if (productNameTranslated) {
      return productNameTranslated;
    }

    return module.productName;
  }

  return '';
};

/**
 * Transform the active moudles to component input
 * { name, label, href, icon }
 *
 * @param bundle
 * @return {Array}
 */
const getModulesData = (bundle) => {
  if (bundle) {
    const site = registry.getSiteManager();
    return Array.from(site.modules).map((mapEntry) => {
      module = mapEntry[1];
      const startView = module.startView || module.views[0];
      return {
        name: module.name,
        label: getLocalizedModuleTitle(module, bundle),
        href: site.getViewPath(startView), // module's defined start view or the first view
        icon: module.faClass,
      };
    });
  }

  return [];
};

/**
 * The state of the menu in the UI
 * @type {{items: Array, selectedItem: string}}
 */
const menuState = {
  items: [],
  selectedItem: '',
  /**
   * Change menu state items
   * @param bundle
   */
  setItems(bundle = null) {
    menuState.items = getModulesData(bundle);
  },
  onclick(module) {
    const site = registry.getSiteManager();
    if (module) {
      menuState.selectedItem = module;
    } else {
      const selectedModule = site.getSelectedModule();
      menuState.selectedItem = selectedModule ? selectedModule.name : '';
    }
  },
};

export default declare([NLSMixin.Dijit], {
  nlsBundles: [{escoModules}],
  constructor() {
    registry.onChange('userEntryInfo', this.updateItems.bind(this));
  },
  localeChange() {
    this.updateItems();
  },
  updateItems() {
    menuState.setItems(this.NLSBundle0);
    m.redraw();
  },
  updateSelectedItem() {
    menuState.onclick();
  },
  view(vnode) {
    this.initNLS(); // TODO @valentino maybe this is too much here. Should be on postCreate? in constructor it's too early due to site not being ready
    this.updateSelectedItem();
    const {items, selectedItem, onclick} = menuState;
    return m('div', m(MenuList, {items, selectedItem, onclick}));
  }
});
