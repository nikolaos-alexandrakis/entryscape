import { Graph } from 'rdfjson';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import { Presenter } from 'rdforms';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import TitleDialog from '../dialog/TitleDialog'; // In template
import templateString from './RDFormsPresentDialogTemplate.html';
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
});
