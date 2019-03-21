import filter from 'blocks/utils/filter';
import registry from 'commons/registry';

export default (node, data) => {
  node.parentElement.onclick = () => {
    filter.setAll();
  };
  if (data.empty) {
    const updateEmpty = () => {
      if (filter.isEmpty()) {
        switch (data.empty) {
          case 'hidden':
            node.parentElement.style.visibility = 'hidden';
            break;
          case 'disabled':
            node.parentElement.setAttribute('disabled', true);
            break;
          case 'removed':
            node.parentElement.style.display = 'none';
            break;
          default:
            node.parentElement.classList.add(data.empty);
        }
      } else {
        switch (data.empty) {
          case 'hidden':
            node.parentElement.style.visibility = '';
            break;
          case 'disabled':
            node.parentElement.removeAttribute('disabled');
            break;
          case 'removed':
            node.parentElement.style.display = '';
            break;
          default:
            node.parentElement.classList.remove(data.empty);
        }
      }
    };
    updateEmpty();
    registry.onChange('blocks_search_filter', updateEmpty);
  }
};
