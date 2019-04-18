import DOMUtil from 'commons/util/htmlUtil';
import getEntry from 'blocks/utils/getEntry';
import { Presenter } from 'rdforms';
import { namespaces } from 'rdfjson';
import linkBehaviour from 'commons/rdforms/linkBehaviourDialog';
import typeIndex from 'commons/create/typeIndex';
import registry from 'commons/registry';

export default function (node, data, items) {
  linkBehaviour.dialog = registry.get('linkBehaviour') !== 'link';
  getEntry(data, (entry) => {
    let template = items.getItem(data.rdformsid || data.template);
    if (!template) {
      const conf = typeIndex.getConf(entry);
      if (conf && conf.template) {
        template = items.getItem(conf.template);
      }
    }
    const fp = {};
    if (data.filterpredicates) {
      data.filterpredicates.split(',').forEach((p) => {
        fp[namespaces.expand(p)] = true;
      });
    }
    node.innerHTML = '';
    const presenter = new Presenter({ compact: data.onecol !== true,
      filterPredicates: fp }, DOMUtil.create('div'));
    node.appendChild(presenter.domNode);
    presenter.show({
      resource: entry.getResourceURI(),
      graph: entry.getMetadata(),
      template,
    });
  });
}
