import filter from 'blocks/utils/filter';

export default (node) => {
  node.parentElement.onclick = () => {
    filter.setAll();
  };
};
