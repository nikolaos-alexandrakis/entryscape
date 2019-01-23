import escoModules from 'commons/nls/escoModules.nls';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import m from 'mithril';
import utils from '../utils';
import MenuList from './menu/MenuList';

/**
 * Helper function to get the module title
 * @param {Object} module
 * @param {Object} bundle
 * @return {String}
 */
const getLocalizedModuleTitle = (module, bundle) => utils.getModuleProp(module, bundle, 'title', true);

/**
 * Transform the active modules to component input
 * { name, label, href, icon }
 *
 * @param bundle
 * @return {Array}
 */
const getModulesData = (bundle) => {
  const site = registry.getSiteManager();
  return Array.from(site.modules).map((mapEntry) => {
    const module = mapEntry[1];
    const startView = module.startView || module.views[0];
    return {
      name: module.name,
      label: getLocalizedModuleTitle(module, bundle),
      href: site.getViewPath(startView), // module's defined start view or the first view
      icon: module.faClass,
    };
  });
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
  nlsBundles: [{ escoModules }],
  constructor() {
    registry.onChange('userEntryInfo', m.redraw);
  },
  localeChange() {
    m.redraw();
  },
  updateSelectedItem() {
    menuState.onclick();
  },
  view() {
    this.updateSelectedItem();
    const items = getModulesData(this.NLSBundle0);
    const { selectedItem, onclick } = menuState;
    return m('div', m(MenuList, { items, selectedItem, onclick }));
  },
  oncreate() {
    this.initNLS();
  },
});
