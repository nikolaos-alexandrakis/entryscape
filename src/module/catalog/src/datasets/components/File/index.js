import m from 'mithril';
import Dropdown from 'commons/components/common/Dropdown';
import {
  getTitle,
} from 'commons/util/metadata';
import bindActions from './actions';

export default (vnode) => {
  const { entry } = vnode.attrs;
  const actions = bindActions(entry, vnode.dom);

  return {
    view(vnode) {
      const { entry } = vnode.attrs;
      const title = getTitle(entry);
      const format = 'someFormat';

      return (
        <div class="distribution__fileRow">
          <div class="distribution__format">
            <p class="distribution__title">{title}</p>
            <p class="file__format">
              <span class="file__format--short">{format}</span>
            </p>
          </div>
          <div>
            <div class="flex--sb">
              <p class="distributionFile__date">Jan 17</p>
              <Dropdown>
                <button
                  class=" btn--distribution fa fa-fw fa-bookmark"
                  title="hello"
                  onclick={actions.openAddFile}
                >
                  <span>ADD FILE LABEL</span>
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
      );
    },
  };
};
