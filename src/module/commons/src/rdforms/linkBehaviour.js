import DOMUtil from '../util/htmlUtil';

import config from 'config';
import {system} from 'rdforms';
import registry from 'commons/registry';
import typeIndex from 'commons/create/typeIndex';
import ContentViewSideDialog from 'commons/contentview/ContentViewSideDialog';

const entrystoreutil = registry.get('entrystoreutil');
const choiceClick = (item, conf, entry) => {
  let dialog = null;
  dialog = new ContentViewSideDialog({
    hideComplete() {
      dialog.dialog.destroy();
      dialog.destroy();
    },
  });
  dialog.show(entry, null, conf);
};

system.attachLinkBehaviour = (node, binding) => {
  const item = binding.getItem();
  if (item.getType() === 'choice') {
    const conf = typeIndex.getConfFromConstraints(item.getConstraints());
    if (conf) {
      node.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const stmt = binding.getStatement();
        const fromGraph = () => {
          const _temp = registry.get('entrystore').getContextById('__temp');
          choiceClick(item, conf, _temp.newLink(stmt.getValue()).setMetadata(stmt.getGraph()));
        };
        if (stmt.isObjectBlank()) {
          fromGraph();
        } else {
          entrystoreutil.getEntryByResourceURI(binding.getValue()).then(
            choiceClick.bind(null, item, conf), fromGraph);
        }
      };
      return;
    }
  }
  node.setAttribute('target', '_blank');
  DOMUtil.addClass(node, 'spaExplicitLink');
  DOMUtil.create('i', {
    class: 'fa fa-external-link rdformsExternalLink',
    'aria-hidden': 'true',
  }, node);
};
system.attachExternalLinkBehaviour = (node, binding) => {
  node.setAttribute('target', '_blank');
  DOMUtil.add(node, 'spaExplicitLink');
  DOMUtil.create('i', {
    class: 'fa fa-external-link rdformsExternalLink',
    'aria-hidden': 'true',
  }, node);
};


// NO RETURN. This one just attaches some listeners
