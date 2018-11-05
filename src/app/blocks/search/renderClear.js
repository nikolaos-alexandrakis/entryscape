define([
  'entryscape-blocks/utils/filter',
], filter => (node) => {
  node.parentElement.onclick = () => {
    filter.setAll();
  };
});
