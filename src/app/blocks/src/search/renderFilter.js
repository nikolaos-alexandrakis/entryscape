import filter from 'blocks/utils/filter';
import registry from 'commons/registry';
import handlebars from 'handlebars/dist/cjs/handlebars';
import utils from './utils';

export default (node, data) => {
  registry.onChange('blocks_search_filter', (filters) => {
    node.innerHTML = '';

    const renderFilter = (item) => {
      const box = document.createElement('div');
      const label = document.createElement('div');
      const button = document.createElement('button');
/*       button.innerHTML = 'x'; */ 
      label.innerHTML = item.label || decodeURIComponent(item.value);
      box.classList.add('filter--results');
      label.classList.add('label--filter');
      button.classList.add('btn--remove');
      box.appendChild(label);
      box.appendChild(button);
      button.onclick = () => filter.remove(item);
      node.appendChild(box);
    };
    Object.keys(filters).forEach((group) => {
      utils.setValues(filters, group, renderFilter);
    });

/*    Object.entries(filters).forEach((filterCollection) => {
      filterCollection[1].forEach((filter) => {
        node.innerHTML += `<div class="filter--results">${filter.label}</div>`;
      });
    });*/
  }, true);
};
