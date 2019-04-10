export default () => ({
  view(vnode) {
    const { disabled, onclick, page, icon } = vnode.attrs;

    return <li className="pagination__arrow">
      <button
        disabled={disabled}
        className={disabled ? 'disabled' : ''}
        onclick={onclick}
        data-page={page}>
        <i className={`fas ${icon}`}/>
      </button>
    </li>;
  },
});
