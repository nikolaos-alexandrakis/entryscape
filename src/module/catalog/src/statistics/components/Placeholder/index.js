import './index.scss';

export default () => ({
  view(vnode) {
    const { label } = vnode.attrs;
    return <div className="row escoPlaceholder">
      <div className="escoPlaceholder--flex">
        <i aria-hidden="true" className="fa fa-4x fa-file" />
        <label className="center-block escoPlaceholder__placeholderText">{label}</label>
      </div>
    </div>;
  },
});
