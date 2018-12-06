import filter from 'blocks/utils/filter';
import registry from 'commons/registry';
import handlebars from 'handlebars/dist/cjs/handlebars';

export default (node, data, items) => {
  registry.onChange(data.use, (results) => {
    if (!filter.isEmpty()) {
      if (data.templateFilter) {
        const handlebarTemplate = handlebars.compile(data.templateFilter, { data: { strict: true, knownHelpersOnly: true } });
        node.innerHTML = handlebarTemplate(results);
      }
      if (data.templateNoFilter) {
        const handlebarTemplate = handlebars.compile(data.templateFilterNoFilter, { data: { strict: true, knownHelpersOnly: true } });
        node.innerHTML = handlebarTemplate(results);
      }
    } else {
      node.innerHTML = '';
    }
  }, true);
};
