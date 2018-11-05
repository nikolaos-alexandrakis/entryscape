import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import TitleDialog from 'commons/dialog/TitleDialog';
import PipelineResultsView from './PipelineResultsView';
import {NLSMixin} from 'esi18n';
import esrePipelineResultListDialog from 'registry/nls/esrePipelineResultListDialog.nls';
import declare from 'dojo/_base/declare';

export default declare([TitleDialog, ListDialogMixin, NLSMixin.Dijit], {
  maxWidth: 800,
  nlsBundles: [{esrePipelineResultListDialog}],
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
    this.updateLocaleStrings(this.NLSBundles.esrePipelineResultListDialog);
  },
  open(params) {
    this.inherited(arguments);
    this.entry = params.row.entry;
    this.plist.show({params: {context: this.entry.getContext().getId()}});
    this.show();
  },
});
