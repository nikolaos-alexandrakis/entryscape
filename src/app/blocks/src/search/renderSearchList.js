import DOMUtil from 'commons/util/htmlUtil';
define([
  'dojo/_base/declare',
  'entryscape-blocks/boot/params',
  'entryscape-commons/defaults',
  'entryscape-blocks/list/List',
  'entryscape-blocks/utils/getEntry',
  'entryscape-blocks/utils/constraints',
  'config',
  'jquery',
], (declare, params, defaults, List, getEntry, constraints, config, jquery) => (node, data, items) => {
  if (data.rowhead || data.rowexpand || data.listempty || data.listhead || data.listbody || data.listplaceholder) {
    data.templates = data.templates || {};
    data.templates.rowhead = data.rowhead;
    data.templates.rowexpand = data.rowexpand;
    data.templates.listempty = data.listempty;
    data.templates.listhead = data.listhead;
    data.templates.listbody = data.listbody;
    data.templates.listplaceholder = data.listplaceholder;
  }

  const sl = new List({
    block: 'searchList',
    conf: data,
    itemstore: items,
    includeHead: !data.headless,
  }, DOMUtil.create('div'));
  node.appendChild(sl);
  if (!sl.includeHead) {
    jquery(sl.domNode).find('.panel').removeClass('panel');
    sl.domNode.classList.add('headless');
  }
  if (data.headless) {
    defaults.onChange('blocks_search_filter', (filter) => {
      if (filter.term) {
        sl.search({}); // Provided via the filter filter.constraint method.
      } else {
        sl.search({ term: '*' });
      }
    }, true);
  }

  params.onInit((urlParams) => {
    sl.contextId = data.context || urlParams.context || config.econfig.context;
    if (typeof sl.contextId === 'number') {
      sl.contextId = '' + sl.contextId;
    }
    if (sl.contextId != null && (data.entry || urlParams.entry || config.econfig.entry) != null) {
      getEntry(data, (entry) => {
        sl.entry = entry;
        if (!data.facets || data.initsearch) {
          sl.show();
        }
      });
    } else if (!data.facets || data.initsearch) {
      sl.show();
    }
  });
});
