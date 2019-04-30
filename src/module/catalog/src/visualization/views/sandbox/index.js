import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';

export default declare(MithrilView, {
  mainComponent() {
    return {
      view() {
        return <h1>Hello World!</h1>;
      },
    };
  },
});
