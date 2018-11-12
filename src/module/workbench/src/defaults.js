import registry from 'commons/registry';
import 'commons/rdforms/linkBehaviour';

export default () => {
  const ns = registry.get('namespaces');
  ns.add('esterms', 'http://entryscape.com/terms/');
};
