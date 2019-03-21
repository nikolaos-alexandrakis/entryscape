import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { i18n } from 'esi18n';
import APICallList from '../components/APICallList';
import DistributionList from '../components/DistributionList';

/**
 *
 * @return {*[]}
 */
export default () => {
  const escaStatisticsNLS = i18n.getLocalization(escaStatistics);

  return [
    {
      id: 'file',
      label: escaStatisticsNLS.tabItemFiles,
      icon: 'fa-file',
      component: DistributionList,
    },
    {
      id: 'api',
      label: escaStatisticsNLS.tabItemApiCalls,
      icon: 'fa-cogs',
      component: APICallList,
    },
  ];
};
