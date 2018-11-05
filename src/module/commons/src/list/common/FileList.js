import registry from '../../registry';
import EntryRow from '../EntryRow';
import FileDialog from '../../dialog/FileDialog';
import BaseList from './BaseList';
import {types} from 'store';
import declare from 'dojo/_base/declare';

const ns = registry.get('namespaces');

const CreateDialog = declare([FileDialog], {
  constructor(params) {
    this.list = params.list;
  },
  open() {
    const self = this;
    this.show(this.list.nlsSpecificBundle.createDialogMessage, null, null, function (inp) {
      if (inp) {
        const pe = registry.get('context').newEntry();
        const md = pe.getMetadata();
        md.add(pe.getResourceURI(), ns.expand('rdf:type'), this.list.entryType);
        pe.commit().then((entry) => {
          entry.getResource(true).putFile(inp).then(() => {
            entry.refresh().then(() => {
              self.list.addRowForEntry(entry);
            });
          });
        });
      }
    });
  },
});

const ERow = declare([EntryRow], {
  getRenderName() {
    let name = this.inherited('getRenderName', arguments);
    if (typeof name === 'undefined') {
      const graph = this.entry.getEntryInfo().getGraph();
      name = graph.findFirstValue(this.entry.getResourceURI(), ns.expand('rdfs:label'));
    }
    return name;
  },
});

export default declare([BaseList], {
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  includeCreateButton: true,
  rowClass: ERow,
  nlsSpecificBundle: {
    listHeader: 'List of files',
    createPopoverTitle: 'Upload a new file',
    createPopoverMessage: 'The file will be described using Dublin Core properties.',
    createButtonLabel: 'Upload file',
    createDialogMessage: 'Choose a file',
  },
  entryType: ns.expand('foaf:Document'),
  postCreate() {
    this.registerDialog('create', CreateDialog);
    this.inherited('postCreate', arguments);
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
  getSearchObj() {
    return registry.get('entrystore').newSolrQuery().rdfType(this.entryType)
      .entryType(types.ET_LOCAL)
      .resourceType('InformationResource');// types.RT_INFORMATIONRESOURCE);
  },
});
