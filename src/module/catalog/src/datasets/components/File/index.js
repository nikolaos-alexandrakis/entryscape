import m from 'mithril';
import dateUtil from 'commons/util/dateUtil';
import Dropdown from 'commons/components/common/Dropdown';
import Button from 'catalog/datasets/components/Button';
import {
  getTitle,
  getModifiedDate,
} from 'commons/util/metadata';
import bindActions from './actions';

export default (vnode) => {
  const { entry } = vnode.attrs;
  const actions = bindActions(entry, vnode.dom);

  return {
    view(vnode) {
      const { entry } = vnode.attrs;
      const title = getTitle(entry);
      const modifiedDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));

      return (
        <div class="distribution__fileRow">
          <div class="distribution__format">
            <p class="distribution__title">{title}</p>
          </div>
          <div>
            <div class="flex--sb">
              <p class="distributionFile__date">{modifiedDate.short}</p>
              <Dropdown>
                <Button
                  class=" btn--distribution fa fa-fw fa-bookmark"
                  title="hello"
                  onclick={actions.openAddFile}
                >
                  ADD FILE LABEL
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>
      );
    },
  };
};
