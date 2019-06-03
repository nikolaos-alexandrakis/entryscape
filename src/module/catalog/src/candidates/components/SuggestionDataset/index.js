import dateUtil from 'commons/util/dateUtil';
import {
  getModifiedDate,
} from 'commons/util/metadata';
import './index.scss';

export default (vnode) => {
  return {
    view(vnode) {
      const { entry } = vnode.attrs;
      const title = 'dataset child';
      const modificationDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));

      return (
        <div class="suggestionChild">
          <div tabindex="0" class="distribution__row flex--sb">
            <p class="title">{title}</p>
            <p class="date">{modificationDate.short}</p>
          </div>
        </div>
      );
    },
  };
};
