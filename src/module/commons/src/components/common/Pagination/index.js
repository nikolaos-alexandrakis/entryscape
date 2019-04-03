import m from 'mithril';
import './index.scss';

// @todo @valentino check alternative to passing state
const onChangePage = (state, callback, newPage) => {
  // call callback
  callback(newPage);

  state.currentPage = newPage;
  m.redraw();
};

export default () => ({
  view(vnode) {
    const { pageSize = 20, totalCount, handleChangePage } = vnode.attrs;
    // calculate (from - to of total)
    const currentPage = vnode.state.currentPage || 0;
    const fromCount = !currentPage ? 0 : currentPage * pageSize;
    const toCount = (fromCount + pageSize) < totalCount ? fromCount + pageSize : totalCount;

    // @todo perhaps improve this if needed
    const onChangePagePrevious = onChangePage.bind(null, vnode.state, handleChangePage, currentPage - 1);
    const onChangePageNext = onChangePage.bind(null, vnode.state, handleChangePage, currentPage + 1);

    return (<ul className="pagination">
      <li class="pagination__arrow">
        <button disabled={!currentPage} className={!currentPage ? 'disabled' : ''} onclick={onChangePagePrevious}>
          <i className="fa fa-chevron-left"/></button>
      </li>
      <span>{fromCount}-{toCount} of {totalCount}</span>
      <li class="pagination__arrow">
        <button disabled={toCount === totalCount} className={toCount === totalCount ? 'disabled' : ''}
                onclick={onChangePageNext}><i
          className="fa fa-chevron-right"/></button>
      </li>
    </ul>);
  },
});
