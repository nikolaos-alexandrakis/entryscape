import registry from 'commons/registry';
import config from 'config';
import DropdownRow from 'commons/list/common/DropdownRow';
import { template } from 'lodash-es';
import declare from 'dojo/_base/declare';

const ns = registry.get('namespaces');
const rdfutils = registry.get('rdfutils');
const type2Conf = {};
if (config.contexttypes) {
  config.contexttypes.forEach((conf) => {
    type2Conf[ns.expand(conf.rdfType)] = conf;
  });
}
const getUserRenderName = (user) => {
  const md = user.getMetadata();
  const name = md.findFirstValue(user.getResourceURI(), 'foaf:name');
  if (name != null) {
    return name;
  }
  const firstname = md.findFirstValue(user.getResourceURI(), 'foaf:firstName');
  const lastname = md.findFirstValue(user.getResourceURI(), 'foaf:lastName');
  if (firstname != null) {
    return firstname + (lastname ? ` ${lastname}` : '');
  }
  return rdfutils.getLabel(user);
};

export default declare([DropdownRow], {
  postCreate() {
    if (config.contexttypes) {
      // register dropdownrow menuitems
      this.registerDropdownItem({
        name: 'catalogContext',
        icon: 'archive',
        iconType: 'fa',
        nlsKey: 'catalog',
        nlsKeyTitle: 'catalogTitle',
        method: 'catalog',
      });
      this.registerDropdownItem({
        name: 'terminologyContext',
        icon: 'sitemap',
        iconType: 'fa',
        nlsKey: 'terminology',
        nlsKeyTitle: 'terminologyTitle',
        method: 'terminology',
      });
      this.registerDropdownItem({
        name: 'workbenchContext',
        icon: 'table',
        iconType: 'fa',
        nlsKey: 'workbench',
        nlsKeyTitle: 'workbenchTitle',
        method: 'workbench',
      });
      this.registerDropdownItem({
        name: 'homeContext',
        icon: 'home',
        iconType: 'fa',
        nlsKey: 'homectx',
        nlsKeyTitle: 'homectxTitle',
        method: 'homecontext',
      });
      this.registerDropdownItem({
        name: 'context',
        icon: 'database',
        iconType: 'fa',
        nlsKey: 'context',
        nlsKeyTitle: 'contextTitle',
        disabled: 'true',
      });
      this.contexttype = '';
      const hEntryInfo = this.entry.getEntryInfo();
      const ctxStmts = hEntryInfo.getGraph().find(this.entry.getResourceURI(), 'rdf:type');
      const hcArr = this.entry.getReferrers('store:homeContext');
      if (ctxStmts.length > 1) {
        ctxStmts.some((ctxStmt) => {
          if (type2Conf.hasOwnProperty(ctxStmt.getValue())) {
            this.contexttype = type2Conf[ctxStmt.getValue()].name;
            return true;
          }
          return false;
        }, this);
      } else if (hcArr.length > 0) {
        this.contexttype = 'homeContext';
      } else {
        this.contexttype = 'context';
        this.disableDropdown();
      }
    }

    this.inherited('postCreate', arguments);
    if (this.contexttype) {
      if (this.contexttype === 'context') {
        this.disableDropdown();
      } else {
        this.removeItem('context');
      }
      this.setDropdownStatus(this.contexttype);
    }
    if (config.admin.showContextTypeControl !== true) {
      this.disableDropdown();
    }
  },
  updateDropdown() {
    if (this.contexttype !== 'homeContext') {
      this.disableCurrentMenuItem(this.contexttype);
      return;
    }
    // check homeconext is for group or user
    // if it is for group, enable corresponding menu item
    // if it is for user, dont enable
    this.isHomeContext().then((value) => {
      if (value && (this.contexttype === 'homeContext' || this.contexttype === 'context')) {
        config.contexttypes.forEach((conf) => {
          if (this.items[conf.name]) {
            this.enableCurrentMenuItem(conf.name);
          }
        });
      } else {
        // change title -say its home context
      }
    });
  },
  updateLocaleStrings() {
    if (this.contexttype) {
      // var title = this.list.nlsSpecificBundle[this.items[this.contexttype].param.nlsKeyTitle];
      // this.setDropdownStatusTitle(title);
      this.setDropdownTitle(this.contexttype);
    }
    this.inherited('updateLocaleStrings', arguments);
  },
  getRenderName() {
    let name = rdfutils.getLabel(this.entry);
    if (name == null) {
      name = this.entry.getResource(true).getName();
      if (name == null || name === '') {
        const hcArr = this.entry.getReferrers('store:homeContext');
        if (hcArr.length > 0) {
          const es = this.entry.getEntryStore();
          const that = this;
          return es.getEntry(es.getEntryURIFromURI(hcArr[0]), { loadResource: true })
            .then((userEntry) => {
              const templatedString = template(that.nlsSpecificBundle.unnamedOwnedWorkspace);
              return templatedString({ name: getUserRenderName(userEntry) || userEntry.getId() });
            }, () => template(that.nlsSpecificBundle.unnamedWorkspace)({ id: that.entry.getId() }));
        }

        return template(this.nlsSpecificBundle.unnamedWorkspace)({ id: this.entry.getId() });
      }
    }
    return name;
  },
  setContextType(ctxType, title) {
    const conf = type2Conf[ns.expand(ctxType)];
    if (this.isDisabled(conf.name)) {
      return;
    }
    this.fixGroupCanReadContextMetadataNoCommit();
    const hEntryInfo = this.entry.getEntryInfo();
    const graph = hEntryInfo.getGraph();
    graph.add(this.entry.getResourceURI(), 'rdf:type', ctxType);
    hEntryInfo.commit().then(() => {
      this.contexttype = conf.name;
      this.setDropdownStatus(this.contexttype);
      // set title
      if (title) {
        this.setDropdownStatusTitle(title);
      } else {
        this.setDropdownTitle(this.contexttype);
      }
      // this.disableCurrentMenuItem(this.contexttype);
    });
    if (conf.entryType) {
      const esu = registry.get('entrystoreutil');
      const context = this.entry.getResource(true);
      esu.getEntryByType(conf.entryType, context).then(null, () => {
        const pe = createEntry(context, conf.entryType);
        const md = pe.getMetadata();
        const subj = pe.getResourceURI();
        md.add(subj, 'rdf:type', conf.entryType);
        md.addL(subj, 'dcterms:title', `Auto created catalog for context ${registry.get('rdfutils').getLabel(this.entry)
        || this.entry.getId()}`);
        pe.commit();
      });
    }
  },
  /**
   * @TODO remove this as soon as we have migrated contexts and all
   * contexts have their metadata readable by owning group (homecontext relation) by default
   */
  fixGroupCanReadContextMetadataNoCommit() {
    const hcArr = this.entry.getReferrers('store:homeContext');
    if (hcArr.length === 1) {
      const es = this.entry.getEntryStore();
      const gid = es.getEntryId(hcArr[0]);
      const ei = this.entry.getEntryInfo();
      const acl = ei.getACL(true);
      if (acl.mread.indexOf(gid) === -1) {
        acl.mread.push(gid);
        ei.setACL(acl);
      }
    }
  },
  catalog() { // removed parameter
    this.setContextType('esterms:CatalogContext');
  },
  terminology() {
    this.setContextType('esterms:TerminologyContext');
  },
  homecontext() {
  },
  workbench() {
    this.setContextType('esterms:WorkbenchContext');
  },
  isHomeContext() {
    return new Promise((resolve) => {
      const hcArr = this.entry.getReferrers('store:homeContext');
      if (hcArr.length > 0) {
        const es = this.entry.getEntryStore();
        return es.getEntry(es.getEntryURIFromURI(hcArr[0]), { loadResource: true })
          .then((principalResourceEntry) => {
            if (principalResourceEntry.isGroup()) {
              resolve(true);
            } else {
              // remove homecontextWarning nls
              resolve(false);
            }
            return this;
          });
      }

      resolve(false);
      return this;
    });
  },
});
