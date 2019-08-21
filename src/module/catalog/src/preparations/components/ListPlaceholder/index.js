import './index.scss';

export default () => ({
  view(vnode) {
    const { label = null, icon = null, height = 100 } = vnode.attrs;
    return <div className="placeholderArea" style={height ? `height: ${height}px;` : ''}>
      {icon ? <i aria-hidden="true" className={`placeholderIcon fas fa-4x fa-${icon}`}/> : null}
      {label ? <label className="mx-auto placeholderLabel">{label}</label> : null}
    </div>;
  },
});
