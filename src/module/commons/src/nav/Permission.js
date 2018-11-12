import registry from 'commons/registry';
import { NLSMixin } from 'esi18n';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import templateString from './PermissionTemplate.html';
import escoPermission from '../nls/escoPermission.nls';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  bid: 'escoPermission',
  nlsBundles: [{ escoPermission }],
  templateString,
  maxWidth: 800,
  show() {
    const site = registry.getSiteManager();
    this.__signinLink.setAttribute('href', site.getViewPath(registry.getSiteConfig().signinView));
  },
});
