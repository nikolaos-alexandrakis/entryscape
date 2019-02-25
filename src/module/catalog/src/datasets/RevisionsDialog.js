import m from 'mithril';
import VersionsDialog from 'commons/store/VersionsDialog';
import declare from 'dojo/_base/declare';
import escoVersionsNLS from 'commons/nls/escoVersions.nls';
import { i18n } from 'esi18n';

export default declare([VersionsDialog], {
  nlsReasonForRevisionMessage: 'distReasonForRevisionMessage',
  nlsNoRevertSameGraphExcludeTitle: 'distNoRevertSameGraphExcludeTitle',
  nlsRevertExcludeMessage: 'distRevertExcludeMessage',
  list: {
    rowMetadataUpdated: () => m.redraw(),
  },

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
  localeChange() {
    this.dialog.updateLocaleStrings(
      this.NLSLocalized.escoList,
      this.NLSLocalized.escoVersions,
    );
  },
  getNLSString(nlsKey) {
    return i18n.localize(escoVersionsNLS, this.list[nlsKey] || this[nlsKey]) || this.NLSBundle0[this[nlsKey]] || '';
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
