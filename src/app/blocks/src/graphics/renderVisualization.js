import getEntry from 'blocks/utils/getEntry';
import VisualizationPreview from 'catalog/datasets/components/VisualizationPreview';


export default (node, data) => {
  getEntry(data, (entry) => {
    const headerNode = document.createElement('div');
    const visNode = document.createElement('div');
    node.appendChild(headerNode);
    node.appendChild(visNode);
    m.mount(visNode, { view: () => m(VisualizationPreview, { configurationEntry: entry }) });
    const md = entry.getMetadata();
    const ruri = entry.getResourceURI();
    const name = md.findFirstValue(ruri, 'dcterms:title');
    if (name) {
      headerNode.classList.add('esbVisLabel');
      headerNode.innerText = name;
    }
  });
};
