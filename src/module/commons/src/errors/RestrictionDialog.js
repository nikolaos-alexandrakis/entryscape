import { i18n, NLSMixin } from 'esi18n';
import DOMUtil from 'commons/util/htmlUtil';
import escoErrors from 'commons/nls/escoErrors.nls';
import config from 'config';
import declare from 'dojo/_base/declare';
import AcknowledgeTextDialog from '../dialog/AcknowledgeTextDialog';

export default declare([AcknowledgeTextDialog, NLSMixin.Dijit], {
  nlsBundles: [{ escoErrors }],
  restrictionPath: '',
  postCreate() {
    this.inherited('postCreate', arguments);
    this.restrictionNode = DOMUtil.create('div', null, this.containerNode);
    if (config.theme.commonRestrictionTextPath) {
      this.restrictionPath = config.theme.commonRestrictionTextPath;
    }
  },
  show(path, titleParam) {
    if (!titleParam) {
      title = this.NLSLocalized0.restrictionHeader;
    }

    this.inherited('show', [path, title]);
    if (this.restrictionPath !== '') {
      const restrictionPath = this.restrictionPath;
      const restrictionNode = this.restrictionNode;
      const language = i18n.getLocale();
      if (this.currentLanguage === language) {
        return;
      }
      this.currentLanguage = language;
      // TODO: @scazan figure this out in webpack
      this.getContentHTML(`${restrictionPath}_${language}.html`).then((content) => {
        restrictionNode.innerHTML = content.text;
      }, () => {
        this.getContentHTML(`${restrictionPath}.html`).then((content) => {
          restrictionNode.innerHTML = `<hr>${content.text}`;
        });
      });
    }
  },
});
