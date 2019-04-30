import m from 'mithril';
import { createSetState } from 'commons/util/util';
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
        </div>
      );
    },
  };
};
