import EntryRow from 'commons/list/EntryRow';
import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';
import declare from 'dojo/_base/declare';
import jquery from 'jquery';
import './escoConceptRow.css';
import util from './util';

export default declare([EntryRow], {
  postCreate() {
    this.divPath = DOMUtil.create('div', { class: 'escoConceptRow__path' }, this.col2Node, this.nameNode); // TODO @scazan verify this 4th arg
    jquery(this.domNode).addClass('termsList');
    this.nameNode.classList.add('escoConceptRow__name');
    this.inherited('postCreate', arguments);
    this.renderPath();
  },

  renderPath() {
    const self = this;
    const path = [];
    const rdfutils = registry.get('rdfutils');
    util.getConceptPath(path, this.entry).then((entries) => {
      const length = entries.length;
      entries.reverse();

      DOMUtil.create('i', {
        class: 'fas fa-sitemap escoConceptRow__icon',
      }, self.divPath);

      entries.forEach((entry, i) => {
        let spanEle;
        if (i === 0) {
          spanEle = DOMUtil.create('span', {
            class: 'escoConceptRow__terminology',
            innerHTML: `${rdfutils.getLabel(entry)} `,
          }, self.divPath);
        } else {
          spanEle = DOMUtil.create('span', { innerHTML: ` ${rdfutils.getLabel(entry)} ` }, self.divPath);
        }
        if (i === 0 && length >= 1) {
          DOMUtil.create('i', { class: 'fas fa-angle-double-right' }, spanEle);
        }
        if (i > 0 && i <= length - 1) {
          DOMUtil.create('i', { class: 'fas fa-angle-right' }, spanEle);
        }
      });
    });
  },
});
