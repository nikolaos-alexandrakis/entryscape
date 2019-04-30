import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import VisualizationSandbox from 'catalog/visualization/components/Sandbox';

export default declare(MithrilView, {
  mainComponent() {
    return {
      view() {
        return <VisualizationSandbox />;
      },
    };
  },
});
