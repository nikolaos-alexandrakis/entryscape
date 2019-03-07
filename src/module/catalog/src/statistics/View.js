import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';

export default declare(MithrilView, {
  mainComponent: () => ({
    view(vnode) {
      return (
        <div>
          <div className="col-md-12">here you can find some info about stats</div>
          <div className="col-md-6">here's going to be the left view</div>
          <div className="col-md-6">here's going to be the right view</div>
        </div>
      );
    },
  }),
});

