import { Graph } from 'rdfjson';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import { Presenter } from 'rdforms';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import registry from 'commons/registry';
import TitleDialog from '../dialog/TitleDialog'; // In template
import templateString from './RDFormsPresentDialogTemplate.html';
import Lookup from '../types/Lookup';
import './rdforms.css';

// TODO not sure if this is the only class depending on rdforms.css
export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin], {
  templateString,
  nlsBundles: [{ escoRdforms }],
  nlsHeaderTitle: 'metadataPresentDialogHeader',
  nlsFooterButtonLabel: 'metadataPresentDialogCloseLabel',

  postCreate() {
    this.presenter = new Presenter({ compact: true }, this.presenter);
  },
  show(uri, graph, tmpl) {
    this.uri = uri;
    this.graph = new Graph(graph.exportRDFJSON());
    this.template = tmpl;
    this.presenter.show({ resource: uri, graph: this.graph, template: tmpl });
    this.dialog.show();
  },
  async showChildEntry(entry, parentEntry, level) {
    const uri = entry.getResourceURI();
    const inUse = await Lookup.inUse(entry, parentEntry);
    const t = registry.get('itemstore').getItem(inUse.templateId());
    this.show(uri, entry.getMetadata(), t, level);
  },
  async showEntry(entry, template, level) {
    const uri = entry.getResourceURI();
    if (template) {
      this.show(uri, entry.getMetadata(), template, level);
    } else {
      const inUse = await Lookup.inUse(entry);
      const t = registry.get('itemstore').getItem(inUse.templateId());
      this.show(uri, entry.getMetadata(), t, level);
    }
  },
});
