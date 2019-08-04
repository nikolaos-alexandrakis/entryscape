import dateUtil from 'commons/util/dateUtil';
import {
  getModifiedDate,
  getTitle,
} from 'commons/util/metadata';
import './index.scss';

export default (vnode) => {
  return {
    view(vnode) {
      const { entry } = vnode.attrs;
      const title = getTitle(entry);
      const modificationDate = dateUtil.getMultipleDateFormats(getModifiedDate(entry));

      return (
        <div class="suggestionChild d-flex">
          <p class="title flex-grow-1">
            <span class="fas fa-cubes"></span>
            {title}
          </p>
          <p class="date">{modificationDate.short}</p>
          <div class="remove">×</div>
        </div>
      );
    },
  };
};
