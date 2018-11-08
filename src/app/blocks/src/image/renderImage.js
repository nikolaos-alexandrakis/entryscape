import DOMUtil from 'commons/util/htmlUtil';
import getEntry from 'blocks/utils/getEntry';

export default function (node, data, items) {
  getEntry(data, (entry) => {
    node.innerHTML = '';
    let src;
    if (data.property) {
      src = entry.getMetadata().findFirstValue(entry.getResourceURI(), data.property);
    } else {
      src = entry.getResourceURI();
    }

    const _node = DOMUtil.create('img', { src });
    node.appendchild(_node);

    _node.onerror = () => {
      if (data.fallback) {
        _node.src = data.fallback;
      }
    };

    if (data.width) {
      _node.style.width = data.width;
    }
    if (data.height) {
      _node.style.height = data.height;
    }
  });
}
