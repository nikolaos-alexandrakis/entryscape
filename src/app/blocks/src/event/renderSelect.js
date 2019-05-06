import registry from 'commons/registry';
import DOMUtil from 'commons/util/htmlUtil';

export default (node, data) => {
  if (data.options) {
    const sel = node.nodeName === 'select' ? node : DOMUtil.create('select');
    node.appendChild(sel);
    data.options.forEach((opt) => {
      const optEl = DOMUtil.create('option', {value: opt});
      sel.appendChild(optEl);
    });
    node.onchange = (ev) => {
      registry.set(data.signal, {
        event: ev,
        data,
      });
    };
  }
};
