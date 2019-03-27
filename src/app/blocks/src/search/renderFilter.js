import filter from 'blocks/utils/filter';
import registry from 'commons/registry';
import handlebars from 'handlebars/dist/cjs/handlebars';
import utils from './utils';

const nodes = [];
let inited = false;
export default (node, data) => {

  nodes.push(node);
  if (inited) {
    return;
  }
  inited = true;
  registry.onChange('blocks_search_filter', (filters) => {
    nodes.forEach((element) => { element.innerHTML = ''; });

    const renderFilter = (item) => {
      nodes.forEach((element) => {
        const box = document.createElement('div');
        const label = document.createElement('div');
        const button = document.createElement('button');
        label.innerHTML = item.label || decodeURIComponent(item.value);
        box.classList.add('filter--results');
        label.classList.add('label--filter');
        button.classList.add('btn--remove');
        box.appendChild(label);
        box.appendChild(button);
        button.onclick = () => filter.remove(item);
        element.appendChild(box);
      });
    };
    Object.keys(filters).forEach((group) => {
      utils.setValues(filters, group, renderFilter);
    });
  }, true);
};
