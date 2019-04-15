import escoList from 'commons/nls/escoList.nls';
import escoVersions from 'commons/nls/escoVersions.nls';
import registry from 'commons/registry';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import List from '../list/List';
import ArrayList from './ArrayList';
import VersionRow from './VersionRow';

export default declare([List, NLSMixin.Dijit], {
  nlsBundles: [{ escoList }, { escoVersions }],
  includeHead: false,
  searchInList: true,
  rowClickDialog: 'expand',
  rowClass: VersionRow,

  postCreate() {
    this.registerRowAction({
      name: 'expand',
      button: 'link',
      iconType: 'fa',
      icon: 'chevron-down',
    });
    this.inherited(arguments);
  },
  localeChange() {
    this.updateLocaleStrings(this.NLSLocalized0, this.NLSBundle1);
  },
  getTemplate() {
    return this.template;
  },
  show(entry, template) {
    this.entry = entry;
    this.template = template;
    this.render();
  },
  search() {
    const es = registry.get('entrystore');
    const revs = this.entry.getEntryInfo().getMetadataRevisions();
    Promise.all(revs.map(rev => es.getEntry(rev.by).then((userEntry) => {
      rev.user = userEntry;
    }))).then(() => {
      this.listView.showEntryList(new ArrayList({ arr: revs }));
    });
  },
});
