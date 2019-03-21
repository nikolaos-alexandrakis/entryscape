import registry from 'commons/registry';

export default (node, data) => {
  node.onclick = (ev) => {
    registry.set(data.signal, {
      event: ev,
      data,
    });
  };
};
