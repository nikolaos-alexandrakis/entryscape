import DOMUtil from '../util/htmlUtil';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import escoPresentExpandable from 'commons/nls/escoPresentExpandable.nls';
import template from './PresentExpandableTemplate.html';
import {Presenter} from 'rdforms'; // In template
import {Graph} from 'rdfjson';
import jquery from 'jquery';
import uiUtil from 'commons/util/uiUtil';
import {NLSMixin} from 'esi18n';

import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import './escoPresentExpandable.css';

export default declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  templateString: template,
  nlsBundles: [{escoRdforms}, {escoPresentExpandable}],
  maxHeight: 115,
  bid: 'escoPresentExpandable',
  postCreate() {
    this.__presenter = new Presenter({}, this.__presenter); // TODO this looks weird, __presenter and presenter. Merge!
    this.presenter = new Presenter({compact: true}, DOMUtil.create('div', null, this.__presenter.domNode));
    this.__presenterPanel.setAttribute('max-size', this.maxHeight);
    this.__external.style.display = 'none';
    this.__showMore.style.display = 'none';
    this.__showLess.style.display = 'none';
    this.inherited('postCreate', arguments);
  },
  localeChange() {
    const popoverOptions = uiUtil.getPopoverOptions();
    popoverOptions.title = this.NLSBundle1.popoverHelpTitle;
    popoverOptions.content = this.NLSBundle1.popoverHelpContent;
    jquery(this.__help).popover(popoverOptions);
  },
  show(uri, graph, tmpl) {
    this.__external.style.display = 'block';
    this.uri = uri;
    this.graph = new Graph(graph.exportRDFJSON());
//            this.graph = new Graph();
//            this.graph.addL(uri, "dcterms:title", "Hello");
    this.template = tmpl;
    this.presenter.show({resource: uri, graph: this.graph, template: tmpl});
    this.__showMore.style.display = 'none';
    this.__showLess.style.display = 'none';
    // add delay to complete rendering
    const delay = 100;
    this._timer = setTimeout(() => {
      this.prefferedH = this.__presenter.getClientHeight + 15;
      if (this.prefferedH > this.maxHeight) {
        this.__showMore.style.display = 'block';
        this.__shader.style.display = 'block';
        this.animate(1, this.maxHeight);
      } else {
        this.__footerPanel.style.display = 'none';
        this.animate(1, this.prefferedH);
      }
      delete this._timer;
    }, delay);
  },
  showMore() {
    this.__showMore.style.display = 'none';
    this.__showLess.style.display = 'block';
    this.__shader.style.display = 'none';
    this.animate(this.maxHeight, this.prefferedH);
  },
  showLess() {
    this.__showMore.style.display = 'block';
    this.__showLess.style.display = 'none';
    this.__shader.style.display = 'block';
    this.animate(this.prefferedH, this.maxHeight);
  },
  animate(start, end) {
    // const slide = basefx.animateProperty({
    // node: this.__presenterPanel,
    // properties: {
    // height: { end, start, units: 'px' },
    // },
    // });
    jquery(this.__presenterPanel).css({
      height: `${start}px`,
    });
    jquery(this.__presenterPanel).animate({
      height: `${end}px`,
    });

    slide.play();
  },
});
