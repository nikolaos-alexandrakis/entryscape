import { isAPIDistribution } from 'catalog/datasets/utils/distributionUtil';
import timeRangeUtil from 'catalog/statistics/utils/timeRange';
import { getRowstoreAPIUUID } from 'catalog/utils/rowstoreApi';
import statsAPI from 'commons/statistics/api';
import { getEntryRenderName } from 'commons/util/entryUtil';

const getMultiDatasetChartData = async (entries, context, timeRange, name = '') => {
  const chartData = { datasets: [] };
  const labels = [];

  try {
    const entryStatisticsPromises = entries.map((entry) => {
      const label = getEntryRenderName(entry);
      if (label) {
        labels.push(label);
      } else if (name) {
        labels.push(name);
      }
      const entryId = isAPIDistribution(entry) ? entry.getId() : getRowstoreAPIUUID(entry); // @todo @valentino check if this works with aliasses
      return statsAPI.getEntryStatistics(context.getId(), entryId, timeRangeUtil.toAPIRequestPath(timeRange));
    });

    await Promise.all(entryStatisticsPromises).then((allEntriesStatsData) => {
      allEntriesStatsData.forEach((statsData, idx) => {
        delete statsData.count;
        const data = timeRangeUtil.normalizeChartData(timeRange, statsData);
        const label = labels[idx];
        chartData.datasets.push({ data, label });
      });
    });
  } catch (err) {
    console.log('Error while tryingg to fetch entry statistics', err);
  }

  return chartData;
};

export {
  getMultiDatasetChartData,
};
