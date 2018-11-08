import registry from 'commons/registry';


export default () => {
  const ns = registry.get('namespaces');
  ns.add('esterms', 'http://entryscape.com/terms/');
  ns.add('dcat', 'http://www.w3.org/ns/dcat#');
};
