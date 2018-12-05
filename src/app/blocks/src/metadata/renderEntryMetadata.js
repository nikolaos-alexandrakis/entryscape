import DOMUtil from 'commons/util/htmlUtil';
import getEntry from 'blocks/utils/getEntry';
import { Presenter } from 'rdforms/main-no-bootstrap-css';
import { namespaces } from 'rdfjson';

export default function (node, data, items) {
  const template = items.getItem(data.rdformsid || data.template);
  getEntry(data, (entry) => {
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
