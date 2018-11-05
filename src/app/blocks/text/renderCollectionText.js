define([
  'entryscape-commons/defaults',
  '../boot/handlebars',
  '../utils/filter',
  '../utils/getEntry',
  '../utils/labels',
], (defaults, handlebars, filter, getEntry, labels) =>
  (node, data) => {
    const update = (col2vals) => {
      const collection = defaults.get(`blocks_collection_${data.collection}`);
      let vals = (col2vals || {})[data.collection];
      const hasValue = data.value ? filter.has(data.collection, data.value) : true;
      const renderValues = (values) => {
        if (data.template) {
          handlebars.run(node, {
            size: values.length,
            value: values.join(data.separator || ' '),
            collection: collection.label || data.collection,
          }, data.template);
        } else {
          node.setAttribute('innerHTML', vals);
        }
      };
      if (hasValue && vals && vals.length > 0) {
        if (vals.find(v => v.label === undefined) && collection.nodetype === 'uri') {
          vals = vals.map(v => (typeof v === 'string' ? v : v.value));
          labels(vals).then((lbls) => {
            const values = [];
            vals.forEach((v) => {
              values.push(lbls[v]);
            });
            renderValues(values);
          });
        } else {
          vals = vals.map(v => (typeof v === 'string' ? v : v.label || v.value));
          renderValues(vals);
        }
      } else if (data.empty) {
        handlebars.run(node, {
          collection: collection.label || data.collection,
        }, data.empty);
      } else {
        node.setAttribute('innerHTML', '');
      }
    };
    update(defaults.get('blocks_search_filter'));
    defaults.onChange('blocks_search_filter', update);
  });
