import m from 'mithril';
import { createSetState } from 'commons/util/util';
import Map from 'commons/rdforms/choosers/components/Map';
import BarChart from 'catalog/statistics/components/BarChart';
import './index.scss';

export default (vnode) => {
  const state = {
  };

  const setState = createSetState(state);

  return {
    view(vnode) {
      return (
        <div className='visualizations__sandbox'>
          hej!

          <Map
            value={'POINT(30 10)'}
          />
          <BarChart
            data={{
              series: [{
                name: '',
                data: [{}],
              }],
            }}
          />
        </div>
      );
    },
  };
};
