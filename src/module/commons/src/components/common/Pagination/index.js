import escoPagination from 'commons/nls/escoPagination.nls';
import { i18n } from 'esi18n';
import './index.scss';

const PAGE_SIZE = 20;

/**
 * Get the new page clicked and call the callback
 *
 * @param {function} callback
 * @param {Event} e
 */
const onChangePage = (callback, e) => {
  const newPage = parseInt(e.currentTarget.dataset.page, 10);
  callback(newPage);
};

/**
 * Calculate the pagination range
 *
 * @param currentPage
 * @param pageSize
 * @param totalCount
 * @return {{toCount: number, fromCount: number}}
 */
const getPageRange = (currentPage, pageSize, totalCount) => {
  const fromCount = !currentPage ? 0 : currentPage * pageSize;
  const toCount = (fromCount + pageSize) < totalCount ? fromCount + pageSize : totalCount;

  return { fromCount, toCount };
};

export default () => ({
  oninit(vnode) {
    const { handleChangePage } = vnode.attrs;
    // this is stored in this context in order to avoid binding in every view
    this.onChangePage = onChangePage.bind(null, handleChangePage);
  },
  view(vnode) {
    const { currentPage = 0, pageSize = PAGE_SIZE, totalCount } = vnode.attrs;

    // calculate "<from> - <to> of <total>"
    const { fromCount, toCount } = getPageRange(currentPage, pageSize, totalCount);
    const paginationText =
      i18n.localize(escoPagination, 'paginationText', { fromCount, toCount, totalCount });

    return (<ul className="pagination">
      <li class="pagination__arrow">
        <button
          disabled={!currentPage} className={!currentPage ? 'disabled' : ''}
          onclick={this.onChangePage}
          data-page={currentPage - 1}>
          <i className="fa fa-chevron-left"/></button>
      </li>
      <span>{paginationText}</span>
      <li class="pagination__arrow">
        <button
          disabled={toCount === totalCount}
          className={toCount === totalCount ? 'disabled' : ''}
          onclick={this.onChangePage}
          data-page={currentPage + 1}>
          <i className="fa fa-chevron-right"/>
        </button>
      </li>
    </ul>);
  },
});
