import registry from 'commons/registry';
import Browser from 'commons/graph/Browser';
import config from 'config';
import declare from 'dojo/_base/delcare';

const ns = registry.get('namespaces');

export default declare([Browser], {
  includeLiterals: false,
  includeResources: false,
  curvedLines: true,
  showNamespaces: false,
  edgeFont: {align: 'top', size: 12},
  maxDepth: 4,
  hierarchical: true,
  selectedColor: 'grey',
  nonEntrydefaultColor: 'rgb(196,196,197)',
  defaultColor: 'lightgrey', // "rgb(224,95,33)",
  graphStyles: {

    catalog: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf187', // \uf0c0
        size: 50,
        // color: '#57169a'
      },
    },
    dataset: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf1b3',
        size: 45,
        // color: '#aa00ff'
      },
    },
    distribution: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf15b',
        size: 50,
        // color: '#aa00ff'
      },
    },
    person: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf0c0',
        size: 50,
        // color: '#aa00ff'
      },
    },
    contact: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf095',
        size: 50,
        // color: '#aa00ff'
      },
    },
  },

  postCreate() {
    this.inherited(arguments);
    this.includePredicates = {};
    this.includePredicates[ns.expand('dcat:dataset')] = true;
    this.includePredicates[ns.expand('dcat:distribution')] = true;
    this.includePredicates[ns.expand('dcat:contactPoint')] = true;
    this.includePredicates[ns.expand('dcterms:publisher')] = true;
    this.includePredicates['http://schema.theodi.org/odrs#copyrightHolder'] = true;
  },
  getNodeGroup(entry) {
    const rtype = entry.getMetadata().findFirstValue(entry.getResourceURI(), ns.expand('rdf:type'));
    if (rtype.indexOf('Catalog') > 0) {
      return 'catalog';
    } else if (rtype.indexOf('Dataset') > 0) {
      return 'dataset';
    } else if (rtype.indexOf('Distribution') > 0) {
      return 'distribution';
    } else if (rtype.indexOf('foaf') > 0 && rtype.indexOf('Document') === -1) {
      return 'person';
    } else if (rtype.indexOf('vcard') > 0) {
      return 'contact';
    }

    return '';
  },

  includeRelation(fromEntry, predicate) {
    return predicate !== 'http://purl.org/dc/terms/source';
  },

  showEntryInForm(entry) {
    const is = registry.get('itemstore');
    const ng = this.getNodeGroup(entry);
    let template;
    const graph = entry.getMetadata();
    const resURI = entry.getResourceURI();
    switch (ng) {
      case 'catalog':
        template = is.getItem(config.catalog.catalogTemplateId);
        break;
      case 'dataset':
        template = is.getItem(config.catalog.datasetTemplateId);
        break;
      case 'distribution':
        template = is.getItem(config.catalog.distributionTemplateId);
        break;
      case 'person':
        template = is.getItem(config.catalog.agentTemplateId);
        break;
      case 'contact':
        template = is.getItem(config.catalog.contactTemplateId);
        break;
      default:
        template = is.detectTemplate(graph, resURI);
    }
    this.presenter.show({
      resource: entry.getResourceURI(),
      graph,
      template,
    });
  },

  show(params) {
    params.entryType = 'dcat:Catalog';
    this.inherited(arguments);
  },
});
