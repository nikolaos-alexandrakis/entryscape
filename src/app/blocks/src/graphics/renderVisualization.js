import getEntry from 'blocks/utils/getEntry';
import VisualizationPreview from 'catalog/datasets/components/VisualizationPreview';


export default (node, data) => {
  getEntry(data, (entry) => {
    m.mount(node, { view: () => m(VisualizationPreview, { configurationEntry: entry }) });
//  node.innerHTML = entry.getId();
  });
};
