import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import PreparationsOverview from './views/Overview';

export default declare(MithrilView, {
  mainComponent: () => ({
    view() {
      return <PreparationsOverview />;
    },
  }),
});


