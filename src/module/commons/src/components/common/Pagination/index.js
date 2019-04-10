import escoPagination from 'commons/nls/escoPagination.nls';
import { LIST_PAGE_SIZE_SMALL } from 'commons/util/util';
import { i18n } from 'esi18n';
import './index.scss';
import PaginationArrow from './PaginationArrow';

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
    const { currentPage = 0, pageSize = LIST_PAGE_SIZE_SMALL, totalCount } = vnode.attrs;

    // calculate "<from> - <to> of <total>"
    const { fromCount, toCount } = getPageRange(currentPage, pageSize, totalCount);
    const paginationText =
      i18n.localize(escoPagination, 'paginationText', { fromCount, toCount, totalCount });

    const lastPage = Math.ceil(totalCount / pageSize) - 1; // pages are 0-indexed

    return (<ul className="pagination">
      <PaginationArrow
        disabled={!currentPage}
        className={!currentPage ? 'disabled' : ''}
        onClick={this.onChangePage}
        page={0}
        icon="fa-angle-double-left"
      />
      <PaginationArrow
        disabled={!currentPage}
        className={!currentPage ? 'disabled' : ''}
        onclick={this.onChangePage}
        page={currentPage - 1}
        icon="fa-angle-left"
      />
      <span>{paginationText}</span>
      <PaginationArrow
        disabled={toCount === totalCount}
        className={toCount === totalCount ? 'disabled' : ''}
        onclick={this.onChangePage}
        page={currentPage + 1}
        icon="fa-angle-right"
      />
      <PaginationArrow
        disabled={toCount === totalCount}
        className={toCount === totalCount ? 'disabled' : ''}
        onclick={this.onChangePage}
        page={lastPage}
        icon="fa-angle-double-right"
      />
    </ul>);
  },
});
