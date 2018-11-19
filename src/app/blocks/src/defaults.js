import commonsDefaults from 'commons/defaults'; // TODO HACK this needs to be before '../config/site' in order for namespaces to be set in registry
import Blocks from './boot/block';

export default async () => {
  await commonsDefaults();
  Blocks.init();
};
