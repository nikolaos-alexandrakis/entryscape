import m from 'mithril';
import { createSetState } from 'commons/util/util';
import Map from 'commons/rdforms/choosers/components/Map';
import BarChartTime from 'catalog/statistics/components/BarChartTime';
import './index.scss';

export default (vnode) => {
  const state = {
  };

  const setState = createSetState(state);

  return {
    view(vnode) {
      return (
        <div className='visualizations__sandbox'>
          hej wheres the map !

          <Map
            value={[
              'POINT(30 10)',
              'POINT(31 10)',
            ]}
          />
        {/*<BarChartTime
            data={{
              series: [{
                name: '',
                data: [{}],
              }],
            }}
          />
          */}
        </div>
      );
    },
  };
};
