import { Graph } from 'rdfjson';
import { ValidationPresenter } from 'rdforms';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import { NLSMixin } from 'esi18n';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import TitleDialog from '../dialog/TitleDialog'; // In template

export default declare([TitleDialog.Content, _WidgetsInTemplateMixin, NLSMixin.Dijit], {
  templateString: '<div><div data-dojo-attach-point="validator"></div></div>',
  maxWidth: 0,
  nlsBundles: [{ escoRdforms }],
  nlsHeaderTitle: 'metadataValidateDialogHeader',
  nlsFooterButtonLabel: 'metadataValidateDialogCloseLabel',
  title: '',
  closeLabel: '',
  postCreate() {
    this.validator = new ValidationPresenter({ compact: true }, this.validator);
  },
  localeChange() {
    if (this.title === '') {
      this.dialog.updateLocaleStrings(this.NLSLocalized0);
    } else {
      const mesg = {};
      mesg[this.nlsHeaderTitle] = this.title;
      mesg[this.nlsFooterButtonLabel] = this.closeLabel;
      this.dialog.updateLocaleStrings(mesg);
    }
  },
  show(uri, graph, template) {
    this.uri = uri;
    this.graph = new Graph(graph.exportRDFJSON());
    this.template = template;
    this.validator.show({ resource: uri, graph: this.graph, template });
    this.dialog.show();
  },
});
