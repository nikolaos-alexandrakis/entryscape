import registry from 'commons/registry';
import commonsDefaults from 'commons/defaults'; // TODO HACK this needs to be before '../config/site' in order for namespaces to be set in registry
import siteConfig from './config/site';

export default () => {
  registry.setSiteConfig(siteConfig);
  commonsDefaults();
};
