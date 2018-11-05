import {NLSMixin} from 'esi18n';
import ArrayList from './ArrayList';
import List from '../list/List';
import registry from '../registry';
import VersionRow from './VersionRow';
import escoList from 'commons/nls/escoList.nls';
import escoVersions from 'commons/nls/escoVersions.nls';

import declare from 'dojo/_base/declare';

export default declare([List, NLSMixin.Dijit], {
  nlsBundles: [{escoList}, {escoVersions}],
  includeHead: false,
  searchInList: true,
  rowClickDialog: 'expand',
  rowClass: VersionRow,

  postCreate() {
    this.registerRowAction({
      name: 'expand',
      button: 'link',
      iconType: 'fa',
      icon: 'chevron-right',
    });
    this.inherited(arguments);
  },
  localeChange() {
    this.updateLocaleStrings(this.NLSBundle0, this.NLSBundle1);
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
      this.listView.showEntryList(new ArrayList({arr: revs}));
    });
  },
});
