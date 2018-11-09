import registry from 'commons/registry';
import FileDialog from 'commons/dialog/FileDialog';
import BaseList from 'commons/list/common/BaseList';
import { types } from 'store';
import escoList from 'commons/nls/escoList.nls';
import escaFiles from 'catalog/nls/escaFiles.nls';
import declare from 'dojo/_base/declare';
import FileRow from './FileRow';
import DetailsDialog from './DetailsDialog';
import ListView from '../utils/ListView';

const ns = registry.get('namespaces');

const CreateDialog = declare([FileDialog], {
  constructor(params) {
    this.list = params.list;
  },
  open() {
    const self = this;
    this.show(this.list.nlsSpecificBundle.createDialogMessage, null, null, (inp, fileName) => {
      const pe = registry.get('context').newEntry();
      const md = pe.getMetadata();
      md.add(pe.getResourceURI(), ns.expand('rdf:type'), this.list.entryType);
      md.add(pe.getResourceURI(), ns.expand('dcterms:title'), {
        value: fileName,
        type: 'literal',
      });
      return pe.commit()
        .then(entry => entry.getResource(true).putFile(inp)
          .then(() => entry.refresh()
            .then(() => {
              self.list.getView().addRowForEntry(entry);
            })));
    });
  },
});

export default declare([BaseList], {
  rowClass: FileRow,
  nlsBundles: [{ escoList }, { escaFiles }],
  includeCreateButton: true,
  includeInfoButton: false,
  nlsCreateEntryMessage: null,
  listViewClass: ListView,
  entryType: ns.expand('esterms:File'),
  postCreate() {
    this.registerDialog('details', DetailsDialog);
    this.registerRowAction({
      first: true,
      name: 'details',
      button: 'default',
      icon: 'link',
      iconType: 'fa',
      nlsKey: 'fileAccessDetails',
      nlsKeyTitle: 'fileAccessDetailsTitle',
    });
    this.inherited('postCreate', arguments);
    // Overriding the default create dialog
    this.registerDialog('create', CreateDialog);
  },

  getTemplate() {
    if (!this.template) {
      this.template = registry.get('itemstore').createTemplateFromChildren([
        'dcterms:title',
        'dcterms:description',
      ]);
    }
    return this.template;
  },
  getSearchObject() {
    const context = registry.get('context');
    /** @type {store/EntryStore} */
    const es = registry.get('entrystore');
    return es.newSolrQuery().rdfType(this.entryType)
      .context(context.getResourceURI())
      .entryType(types.ET_LOCAL)
      .resourceType('InformationResource');// types.RT_INFORMATIONRESOURCE);
  },
});

