import registry from 'commons/registry';
import commonsDefaults from 'commons/defaults'; // TODO HACK this needs to be before '../config/site' in order for namespaces to be set in registry
import catalogDefaults from 'catalog/defaults'; // init catalog
import termsDefaults from 'terms/defaults'; // init catalog
import workbenchDefaults from 'workbench/defaults'; // init catalog
import adminDefaults from 'admin/defaults'; // init catalog
import siteConfig from './config/site';

export default async () => {
  console.log(4);
  registry.set('siteConfig', siteConfig);
  await commonsDefaults();
  console.log(5);
  catalogDefaults();
  termsDefaults();
  workbenchDefaults();
  adminDefaults();
  return registry;
};
