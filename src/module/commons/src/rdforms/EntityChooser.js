import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _WidgetBase from 'dijit/_WidgetBase';
import declare from 'dojo/_base/declare';
import { NLSMixin } from 'esi18n';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import registry from 'commons/registry';
import DOMUtil from '../util/htmlUtil';
import template from './EntityChooserTemplate.html';
import Lookup from '../types/Lookup';
import './escoEntityChooser.css';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  nlsBundles: [{ escoRdforms }],
  templateString: template,
  bid: 'escoEntityChooser',

  constructor(args) {
    this.onChange = args.onChange;
  },

  postCreate() {
    this.__select.onchange = (val) => {
      this.inUse = Lookup.get(val.srcElement.value);
      this.onChange();
    };
    this.inherited(arguments);
  },

  clear() {
    delete this.entry;
    delete this.inUse;
    delete this.saved;
    delete this.primary;
  },
  async update(entry, inUse) {
    this.entry = entry;
    this.inUse = inUse;
    this.saved = inUse;
    const localize = registry.get('localize');
    const options = await Lookup.options(entry);
    if (options.secondary.length > 0) {
      this.__select.innerHTML = '';
      this.domNode.style.display = '';
      this.primary = options.primary;
      const etList = [options.primary].concat(options.secondary);
      etList.forEach((et) => {
        DOMUtil.create('option', { value: et.id(), innerHTML: localize(et.label()) }, this.__select);
      });
      this.__select.value = inUse.id();
    } else {
      this.hide();
    }
  },

  getInUse() {
    return this.inUse;
  },

  isModified() {
    return this.inUse !== this.saved;
  },

  save() {
    const ei = this.entry.getEntryInfo();
    const graph = ei.getGraph();
    graph.findAndRemove(ei.getMetadataURI(), 'esterms:entityType');
    if (this.inUse !== this.primary) {
      graph.add(ei.getMetadataURI(), 'esterms:entityType', this.inUse.id());
    }
    return ei.commit().then(() => {
      this.saved = this.inUse;
    });
  },

  hide() {
    this.domNode.style.display = 'none';
  },
});
