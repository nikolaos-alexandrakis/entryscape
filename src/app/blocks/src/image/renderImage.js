import DOMUtil from 'commons/util/htmlUtil';
import getEntry from 'blocks/utils/getEntry';

export default function (node, data) {
  getEntry(data, (entry) => {
    node.innerHTML = '';
    let src;
    if (data.property) {
      const stmts = entry.getMetadata().find(entry.getResourceURI(), data.property);
      if (stmts.length > 0) {
        src = stmts[Math.floor(Math.random() * stmts.length)].getValue();
      }
    } else {
      src = entry.getResourceURI();
    }
    if (!src) {
      src = data.fallback;
    }

    const _node = DOMUtil.create('img', { src });
    node.appendChild(_node);

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
