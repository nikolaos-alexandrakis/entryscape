import commonsDefaults from 'commons/defaults'; // TODO HACK this needs to be before '../config/site' in order for namespaces to be set in registry
import bootBlocks from './boot/block';

export default async () => {
  await commonsDefaults();
  bootBlocks();
};
