import registry from 'commons/registry';
import { NLSMixin } from 'esi18n';
import escaFiles from 'catalog/nls/escaFiles.nls';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import template from './APIInfoTemplate.html';
import './files.css';

const ns = registry.get('namespaces');
const resultColumnName = ns.expand('store:pipelineResultColumnName');

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  templateString: template,
  nlsBundles: [{ escaFiles }],

  postCreate() {
    this.inherited('postCreate', arguments);
  },
  hide() {
    this.domNode.style.display = 'none';
  },
  show(entry) {
    const stmts = entry.getCachedExternalMetadata().find(null, resultColumnName);
    const cols = stmts.map(stmt => stmt.getValue());
    if (cols.length > 0) {
      this.domNode.style.display = '';
      this.apiColumns.innerHTML = cols.join(', ');
      const exampleURL = `${entry.getResourceURI()}?${cols[0]}=some_string_pattern`;
      this.searchExampleLink.innerHTML = exampleURL;
      this.searchExampleLink.setAttribute('href', exampleURL);
    }
  },
});
