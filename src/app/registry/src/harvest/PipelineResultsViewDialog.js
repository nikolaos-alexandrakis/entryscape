import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import esrePipelineResultListDialog from 'registry/nls/esrePipelineResultListDialog.nls';
import PipelineResultsView from './PipelineResultsView';

export default declare([TitleDialog, ListDialogMixin, NLSMixin.Dijit], {
  maxWidth: 800,
  nlsBundles: [{ esrePipelineResultListDialog }],
  nlsHeaderTitle: 'pipelineResultRowHeader',
  nlsFooterButtonLabel: 'pipelineResultRowButton',

  postCreate() {
    this.inherited(arguments);
    this.plist = new PipelineResultsView({
      dialog: this,
    }, this.containerNode);
  },
  localeChange() {
    // this.inherited('localeChange', esrePipelineResultListDialog);
    this.updateLocaleStrings(this.NLSLocalized.esrePipelineResultListDialog);
  },
  open(params) {
    this.inherited(arguments);
    this.entry = params.row.entry;
    this.plist.show({ params: { context: this.entry.getContext().getId() } });
    this.show();
  },
});
