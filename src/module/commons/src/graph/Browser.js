import 'vis'; // TODO: @scazan Is this actually used here?
import { Presenter } from 'rdforms';
import { cloneDeep } from 'lodash-es';
import EntryChooser from 'commons/rdforms/choosers/EntryChooser';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import templateString from './BroswerTemplate.html';

EntryChooser.registerDefaults();

const rdfutils = registry.get('rdfutils');
const ns = registry.get('namespaces');
const es = registry.get('entrystore');
const esu = registry.get('entrystoreutil');

let strIdCounter = 0;

export default declare([_WidgetBase, _TemplatedMixin], {
  templateString,
  includeLiterals: false,
  showNamespaces: true,
  includeResources: false,
  curvedLines: true,
  edgeFont: { align: 'top', size: 12 },
  maxDepth: 4,
  graphOptions: {
    interaction: {
      selectable: true,
      selectConnectedEdges: false,
    },
    nodes: {
      labelHighlightBold: false,
    },
    edges: {
      labelHighlightBold: false,
      selectionWidth: 0,
      width: 2,
    },
    height: '100%',
    width: '100%',
  },
  hierarchical: true,
  selectedColor: 'rgb(217,224,33)',
  defaultColor: 'rgb(140,198,63)', // "rgb(224,95,33)",
  graphStyles: null,
  includePredicates: null,

  postCreate() {
    this.inherited(arguments);
    this.presenter = new Presenter({ compact: true }, this.rdformsNode);
    this.nodes = new vis.DataSet([]);
    this.edges = new vis.DataSet([]);
    this.data = {
      nodes: this.nodes,
      edges: this.edges,
    };
    const options = cloneDeep(this.graphOptions);
    if (this.hierarchical) {
      options.layout = options.layout || {};
      options.layout.hierarchical = {
        direction: 'LR',
      };
    }
    if (this.curvedLines) {
      options.edges = options.edges || {};
      options.edges.smooth = {
        type: 'diagonalCross', // 'cubicBezier',
        forceDirection: 'horizontal',
        roundness: 0.4,
      };
    }
    if (this.graphStyles != null) {
      options.groups = this.graphStyles;
    }
    this.network = new vis.Network(this.graphNode, this.data, options);
    this.network.on('click', (params) => {
      if (params.nodes.length === 1 && params.nodes[0] !== this.selectedEntry) {
        this.showInForm(params.nodes[0]);
        this.nodes.update([
          this.colorNode({ id: params.nodes[0] }, true),
          this.colorNode({ id: this.selectedEntry })]);
        this.selectedEntry = params.nodes[0];
      }
    });
    this.network.on('doubleClick', (params) => {
      if (params.nodes.length === 1) {
        const sm = registry.getSiteManager();
        const siteParams = cloneDeep(sm.getUpcomingOrCurrentParams());
        siteParams.entry = es.getEntryId(params.nodes[0]);
        sm.render(sm.getUpcomingOrCurrentView(), siteParams);
      }
    });
  },

  reset() {
    this.nodes.clear();
    this.edges.clear();
    this.currentNode = this.nodes.add(this.colorNode({
      group: this.getNodeGroup(this.entry),
      id: this.entry.getURI(),
      label: rdfutils.getLabel(this.entry) || this.entry.getId(),
      color: this.selectedColor,
      level: 1,
    }, true));
  },

  addEntry(entry, depth) {
    let depth_ = depth;
    const promises = [];
    if (depth_ < this.maxDepth) {
      depth_ += 1;
      entry.getMetadata().find(entry.getResourceURI()).forEach((stmt) => {
        switch (stmt.getType()) {
          case 'uri':
            if (stmt.getValue().indexOf(es.getBaseURI()) === 0
              || (this.includePredicates && this.includePredicates[stmt.getPredicate()])) {
              promises.push(this.addRelatedEntry(entry, stmt.getPredicate(),
                stmt.getValue(), depth_));
            } else if (this.includeResources) {
              this.addRelatedResource(entry, stmt.getPredicate(),
                stmt.getValue(), depth_);
            }
            break;
          case 'literal':
            if (this.includeLiterals) {
              this.addRelatedValue(entry, stmt.getPredicate(), stmt.getValue(), depth_);
            }
            break;
          default:
        }
      }, this);
    }
    return Promise.all(promises);
  },

  addRelatedEntry(fromEntry, predicate, toURI, depth, reverse) {
    if (this.includeRelation(fromEntry, predicate, toURI)) {
      return esu.getEntryByResourceURI(toURI).then((entry) => {
        const toEntryURI = entry.getURI();
        if (!this.nodes.get(toEntryURI)) {
          this.nodes.add(this.colorNode({
            group: this.getNodeGroup(entry),
            id: toEntryURI,
            label: rdfutils.getLabel(entry) || entry.getId(),
            level: depth,
          }));
        }
        if (reverse) {
          this.edges.add({
            color: this.defaultColor,
            to: fromEntry.getURI(),
            from: toEntryURI,
            arrows: 'to',
            label: this.getPredicateLabel(predicate),
            font: this.edgeFont,
          });
        } else {
          this.edges.add({
            color: this.defaultColor,
            from: fromEntry.getURI(),
            to: toEntryURI,
            arrows: 'to',
            label: this.getPredicateLabel(predicate),
            font: this.edgeFont,
          });
          return this.addEntry(entry, depth);
        }
        return undefined;
      });
    }
    return undefined;
  },

  isIcon() {
    return true;
  },
  colorNode(options, isSelected) {
    const color = isSelected ? this.selectedColor : this.defaultColor;
    if (this.isIcon(options)) {
      options.icon = options.icon || {};
      options.icon.color = color;
    } else {
      options.color = color;
    }

    return options;
  },

  getPredicateLabel(predicate) {
    if (this.showNamespaces) {
      return ns.shorten(predicate);
    }
    const name = ns.nsify(predicate).localname;
    return name == null || name === '' ? ns.shorten(predicate) : name;
  },

  getNodeGroup() {
  },

  includeRelation() {
    return true;
  },

  addRelatedResource(fromEntry, predicate, toURI, depth) {
    if (this.includeRelation(fromEntry, predicate, toURI)) {
      this.nodes.add(this.colorNode({ id: toURI, label: ns.shorten(toURI), level: depth }));
      this.edges.add({
        color: this.defaultColor,
        from: fromEntry.getURI(),
        to: toURI,
        arrows: 'to',
        label: this.getPredicateLabel(predicate),
        font: this.edgeFont,
      });
    }
  },

  addRelatedValue(fromEntry, predicate, value, depth) {
    if (this.includeRelation(fromEntry, predicate, value)) {
      strIdCounter += 1;
      const id = `__str_${strIdCounter}`;
      this.nodes.add({
        id,
        label: value,
        shape: 'box',
        level: depth,
        color: this.nonEntryDefaultColor,
      });
      this.edges.add({
        color: this.defaultColor,
        from: fromEntry.getURI(),
        to: id,
        arrows: 'to',
        label: this.getPredicateLabel(predicate),
        font: this.edgeFont,
      });
    }
  },

  render(entry) {
    this.entry = entry;
    this.reset();
    this.showInForm(entry.getURI());
    this.selectedEntry = entry.getURI();
    this.addEntry(entry, 1).then(() => {
      this.network.stabilize();
    });
    const stmts = entry.getReferrersGraph().find();
    array.forEach(stmts, function (stmt) {
      this.addRelatedEntry(entry, stmt.getPredicate(), stmt.getSubject(), 0, true);
    }, this);
  },

  showInForm(uri) {
    es.getEntry(uri).then(this.showEntryInForm.bind(this));
  },

  showEntryInForm(entry) {
    const graph = entry.getMetadata();
    const resURI = entry.getResourceURI();
    const is = registry.get('itemstore');
    this.presenter.show({
      resource: entry.getResourceURI(),
      graph,
      template: is.detectTemplate(graph, resURI),
    });
  },

  show(params) {
    this.viewParams = params;
    const context = registry.get('context');
    if (context != null) {
      if (params.entry != null) {
        context.getEntryById(params.entry).then(this.render.bind(this));
      } else if (params.entryType) {
        registry.get('entrystoreutil').getEntryByType(params.entryType)
          .then(this.render.bind(this));
      }
    }
  },
});
