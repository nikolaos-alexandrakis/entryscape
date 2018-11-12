import catalogDefaults from 'catalog/defaults'; // init catalog
import typeIndex from 'commons/create/typeIndex';
import commonsDefaults from 'commons/defaults'; // TODO HACK this needs to be before '../config/site' in order for namespaces to be set in registry
import registry from 'commons/registry';
import config from 'config';
import siteConfig from './config/site';

export default () => {
  registry.set('siteConfig', siteConfig);
  commonsDefaults();
  catalogDefaults();

  const ns = registry.get('namespaces');
  ns.add('storepr', 'http://entrystore.org/terms/pipelineresult#');

  const mandatoryTypes = config.registry.mandatoryValidationTypes.map(mt => ns.expand(mt));
  registry.set('mandatoryValidationTypes', mandatoryTypes);

  // Copy over templates from entityTypes (and indirectly from catalog config)
  if (!config.registry.type2template && config.registry.validationTypes) {
    const constraints = {};
    const rtype = ns.expand('rdf:type');
    config.registry.type2template = {};
    const t2t = config.registry.type2template;

    config.registry.validationTypes.forEach((vt) => {
      constraints[rtype] = ns.expand(vt);
      const conf = typeIndex.getConfFromConstraints(constraints);
      t2t[vt] = conf.template;
    });
  }

  const validationType2template = {};
  registry.onInit('itemstore').then((itemstore) => {
    const t2t = config.registry.type2template;
    Object.keys(t2t).forEach((cls) => {
      validationType2template[ns.expand(cls)] = itemstore.getItem(t2t[cls]);
    });
  });

  registry.set('type2template', validationType2template);
};
