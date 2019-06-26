export default () => ({
  view(vnode) {
    const { disabled, onclick, page, icon } = vnode.attrs;

    return <li className={`page-item ${disabled ? 'disabled' : ''}`}>
      <a
        className="page-link"
        onclick={onclick}
        data-page={page}>
        <i aria-hidden="true" className={`fas ${icon}`} />
      </a>
    </li>;
  },
});
