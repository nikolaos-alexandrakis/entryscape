import config from 'config';
import merge from 'commons/merge';
import registry from 'commons/registry';

import renderEntryMetadata from 'blocks/metadata/renderEntryMetadata';
import renderSearchList from 'blocks/search/renderSearchList';
import renderSimpleSearch from 'blocks/search/renderSimpleSearch';
import renderMultiSearch from 'blocks/search/renderMultiSearch';
import renderSearchFilter from 'blocks/search/renderSearchFilter';
import renderClear from 'blocks/search/renderClear';
import renderFacets from 'blocks/search/renderFacets';
import renderFormatList from 'blocks/list/renderFormatList';
import renderCatalogList from 'blocks/list/renderCatalogList';
import renderList from 'blocks/list/renderList';
import renderEntryLink from 'blocks/text/renderEntryLink';
import renderEntryText from 'blocks/text/renderEntryText';
import renderTemplate from 'blocks/text/renderTemplate';
import renderCollectionText from 'blocks/text/renderCollectionText';
import renderImage from 'blocks/image/renderImage';
import renderSlider from 'blocks/image/renderSlider';
import renderMap from 'blocks/graphics/renderMap';
import renderChart from 'blocks/graphics/renderChart';
import renderGraph from 'blocks/graphics/renderGraph';
import preload from './preload';
import error from './error';

// import  "commons/rdforms/linkBehaviourDialog";

const Block = {};

const block2function = {
  view: renderEntryMetadata,
  list: renderList,
  formatList: renderFormatList,
  catalogList: renderCatalogList,
  link: renderEntryLink,
  text: renderEntryText,
  template: renderTemplate,
  image: renderImage,
  slider: renderSlider,
  facets: renderFacets,
  simpleSearch: renderSimpleSearch,
  multiSearch: renderMultiSearch,
  searchList: renderSearchList,
  searchFilter: renderSearchFilter,
  clear: renderClear,
  collectionText: renderCollectionText,
  map: renderMap,
  chart: renderChart,
  graph: renderGraph,
  config: preload,
  viewMetadata: renderEntryMetadata, // deprecated, use view
  search: renderSearchList, // deprecated, use searchList
  preload, // deprecated, use config
  helloworld(node, data, items) { node.innerHTML = data.message || 'Hello world!'; },
};

(config.econfig.blocks || []).forEach((bc) => {
  if (bc.extends && block2function[bc.extends]) {
    block2function[bc.block] = function (node, data, items) {
      block2function[bc.extends](node, merge(bc, data), items);
    };
  } else if (bc.run) {
    block2function[bc.block] = bc.run;
  }
});

Block.list = Object.keys(block2function);
Block.run = function (block, node, data) {
  registry.get('itemstore', (items) => {
    if (data.error) {
      error(node, data, items);
    } else {
      const f = block2function[block || ''];
      if (f) {
        f(node, data, items);
      }
    }
  });
};

Block.run('preload', null, config.econfig);

config.nodes.forEach((nobj) => {
  Block.run(nobj.data.block || nobj.data.component, nobj.node, nobj.data);
});

export default Block;
