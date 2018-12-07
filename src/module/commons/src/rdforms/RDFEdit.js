import { converters, Graph } from 'rdfjson';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import DOMUtil from '../util/htmlUtil';
import template from './RDFEditTemplate.html';
import './escoRDFEdit.css';

export default declare([_WidgetBase, _TemplatedMixin], {
  templateString: template,
  graph: '',
  subView: 'rdf/xml',

  /**
   * @param {rdfjson.Graph|String|Object} rdf supports rdf/xml as a string or
   * rdf/json as a Graph, a string or a Object.
   * @return {undefined|Object} if undefined everything went well,
   * if a object something went wrong and the report was returned.
   */
  setRDF(rdf) {
    const report = converters.detect(rdf);
    if (!report.error) {
      this.switchState(report.format, report.graph);
    }
    return report;
  },

  switchState(format, graph) {
    if (this.switchRDF(format, graph)) {
      this.switchTab(format);
    }
  },

  switchTab(syntax) {
    if (syntax === 'rdf/json') {
      DOMUtil.removeClass(this.rdfxmlTab, 'active');
      DOMUtil.addClass(this.rdfjsonTab, 'active');
      DOMUtil.removeClass(this.rdfxmlTabContent, 'active');
      DOMUtil.addClass(this.rdfjsonTabContent, 'active');
    } else {
      DOMUtil.removeClass(this.rdfjsonTab, 'active');
      DOMUtil.addClass(this.rdfxmlTab, 'active');
      DOMUtil.removeClass(this.rdfjsonTabContent, 'active');
      DOMUtil.addClass(this.rdfxmlTabContent, 'active');
    }
  },

  rdfjsonClicked() {
    this.switchState('rdf/json');
  },
  rdfxmlClicked() {
    this.switchState('rdf/xml');
  },

  switchRDF(syntax, graph) {
    let _graph = graph;
    try {
      _graph = _graph || this.getGraph();
      this.subView = syntax;
      if (_graph) {
        this.setGraph(_graph);
        return true;
      }
    } catch (err) {
      // TODO better way to handle this?
      return false;
    }
    return false;
  },

  /**
   * @return {Object} a report as an object with a graph and if
   * something has gone wrong an error message.
   */
  getRDF() {
    try {
      const graph = this.getGraph();
      if (graph.validate().valid) {
        return { graph, format: this.subView };
      }
      return { error: 'RDF/JSON is not valid.' };
    } catch (e) {
      switch (this.subView) {
        case 'rdf/xml':
          return { error: 'RDF/XML is invalid' };
        case 'rdf/json':
          return { error: 'RDF/JSON is invalid' };
        default:
          return { error: 'Unsupported format' };
      }
    }
  },

  /**
   * @returns {rdfjson.Graph}
   */
  getGraph() {
    switch (this.subView) {
      case 'rdf/xml':
        return this.getRDFXML() || this.origGraph;
      case 'rdf/json':
        return this.getRDFJSON() || this.origGraph;
      default:
        return null;
    }
  },
  getCurrentSubView() {
    return this.subView;
  },
  /**
   * @param {rdfjson.Graph} graph
   */
  setGraph(graph) {
    this.origGraph = graph;
    switch (this.subView) {
      case 'rdf/xml':
        this.setRDFXML(graph);
        break;
      case 'rdf/json':
        this.setRDFJSON(graph);
        break;
      default:
        break;
    }
  },

  /**
   * Called everytime the RDF is edited (after a delay of 400 milliseconds).
   */
  onRDFChange() {
  },

  //= ==================================================
  // Private methods
  //= ==================================================
  postCreate() {
    this.inherited(arguments);
    let timer;
    const onRDFChange = this.onRDFChange.bind(this);
    const onRDFChangeFunc = function () {
      clearTimeout(timer);
      timer = setTimeout(onRDFChange, 400);
    };
    this._rdfjson.onkeyup = onRDFChangeFunc;
    this._rdfxml.onkeyup = onRDFChangeFunc;
  },
  getRDFXML() {
    if (this.rdfxmlValue.length <= 100000) {
      return converters.rdfxml2graph(this.getValueFromNode(this._rdfxml));
    }
    return this.origGraph || new Graph();
  },
  setRDFXML(graph) {
    this.rdfxmlValue = converters.rdfjson2rdfxml(graph);
    if (this.rdfxmlValue.length > 100000) {
      this._rdfxml.setAttribute('readonly', true);
      this.setValueToNode(this._rdfxml,
        `${this.rdfxmlValue.substring(0, 100000)}\n    ----- \n RDF to large, truncating it. \n   ------`);
    } else {
      this._rdfxml.removeAttribute('readonly');
      this.setValueToNode(this._rdfxml, this.rdfxmlValue);
    }
  },
  setValueToNode(node, value) {
    node.value = value;
  },
  getValueFromNode(node) {
    return node.value;
  },
  getRDFJSON() {
    if (this.rdfjsonValue.length <= 100000) {
      const rdfStr = this.getValueFromNode(this._rdfjson);
      return new Graph(JSON.parse(rdfStr == null || rdfStr === '' ? '{}' : rdfStr));
    }
    return this.origGraph || new Graph();
  },
  setRDFJSON(graph) {
    this.rdfjsonValue = JSON.stringify(graph.exportRDFJSON(), 0, 2);
    if (this.rdfjsonValue.length > 100000) {
      this._rdfjson.setAttribute('readonly', true);
      this.setValueToNode(this._rdfjson,
        `${this.rdfjsonValue.substring(0, 100000)}\n    ----- \n RDF to large, truncating it. \n   ------`);
    } else {
      this._rdfjson.removeAttribute('readonly');
      this.setValueToNode(this._rdfjson, this.rdfjsonValue);
    }
  },
});
