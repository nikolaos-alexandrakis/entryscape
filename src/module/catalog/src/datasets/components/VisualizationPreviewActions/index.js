import './index.scss';

export default () => ({
  view(vnode) {
    const { onclick } = vnode.attrs;
    return <div className="chart__actions">
      <h5>Name of visualization</h5>
      <div>
        <button className="btn btn-secondary fas fa-edit" onclick={onclick}></button>
        <button className="btn btn-secondary fas fa-times"></button>
      </div>
    </div>;
  },
});
