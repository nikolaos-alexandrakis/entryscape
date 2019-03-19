import escaStatistics from 'catalog/nls/escaStatistics.nls';
import { i18n } from 'esi18n';
import APICallList from '../components/APICallList';
import DistributionList from '../components/DistributionList';

/**
 * @return {*[]}
 */
const tabs = [
  {
    id: 'file',
    label: i18n.localize(escaStatistics, 'tabItemFiles'),
    icon: 'fa-file',
    component: DistributionList,
  },
  {
    id: 'api',
    label: i18n.localize(escaStatistics, 'tabItemApiCalls'),
    icon: 'fa-repeat',
    component: APICallList,
  },
];

/**
 *
 * @return {*[]}
 */
export default () => tabs;
