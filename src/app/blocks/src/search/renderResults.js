import filter from 'blocks/utils/filter';
import registry from 'commons/registry';
import handlebars from 'handlebars/dist/cjs/handlebars';

export default (node, data) => {
  registry.onChange(data.use, (results) => {
    if (!filter.isEmpty()) {
      if (data.templatefilter) {
        const handlebarTemplate = handlebars.compile(data.templatefilter, { data: { strict: true, knownHelpersOnly: true } });
        node.classList.remove('entryscape');
        node.classList.add('filtered--results');
        node.innerHTML = handlebarTemplate(results);
      }
      if (data.templateNoFilter) {
        const handlebarTemplate = handlebars.compile(data.templatefilterNoFilter, { data: { strict: true, knownHelpersOnly: true } });
        node.innerHTML = handlebarTemplate(results);
      }
    } else {
      node.classList.remove('filtered--results');
      node.innerHTML = '';
    }
  }, true);
};
