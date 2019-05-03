import getEntry from 'blocks/utils/getEntry';
import VisualizationPreview from 'catalog/datasets/components/VisualizationPreview';


export default (node, data) => {
  getEntry(data, (entry) => {
    m.render(node, m(VisualizationPreview, { configurationEntry: entry }));
//  node.innerHTML = entry.getId();
  });
};
