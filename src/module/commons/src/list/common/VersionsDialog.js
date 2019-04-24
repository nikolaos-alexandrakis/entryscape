import declare from 'dojo/_base/declare';
import ListDialogMixin from './ListDialogMixin';
import VersionsDialog from '../../store/VersionsDialog';

export default declare([VersionsDialog, ListDialogMixin], {
  nlsReasonForRevisionMessage: 'reasonForRevisionMessage',
  nlsNoRevertSameGraphExcludeTitle: 'noRevertSameGraphExcludeTitle',
  nlsRevertExcludeMessage: 'revertExcludeMessage',

  postCreate() {
    if (this.excludeProperties.length === 0) {
      if (this.list.versionExcludeProperties != null
        && this.list.versionExcludeProperties.length > 0) {
        this.excludeProperties = this.list.versionExcludeProperties;
      }
    }

    this.inherited(arguments);
  },
  open(params) {
    this.inherited(arguments);
    this.show(params.row.entry, params.template || this.list.getTemplate(params.row.entry));
  },
  getNLSString(nlsKey) {
    return this.list.nlsSpecificBundle[this.list[nlsKey] || this[nlsKey]] || this.NLSLocalized0[this[nlsKey]] || '';
  },
  getRevertExcludeMessage() {
    const m = this.getNLSString('nlsRevertExcludeMessage');
    return m != null ? `<br><br>${m}` : '';
  },
  getReasonForRevisionMessage() {
    return this.getNLSString('nlsReasonForRevisionMessage');
  },
  getNoRevertSameGraphExcludeTitle() {
    return this.getNLSString('nlsNoRevertSameGraphExcludeTitle');
  },
});
