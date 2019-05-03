import './index.scss';


export default () => {
  return {
    view(vnode) {
      const { configurationEntry, onclickEdit, onclickRemove } = vnode.attrs;
      return <div className="chart__actions">
        <h5>Name of visualization</h5>
        <div>
          <button className="btn btn-secondary fas fa-edit" onclick={onclickEdit} />
          <button className="btn btn-secondary fas fa-times" onclick={() => onclickRemove(configurationEntry)} />
        </div>
      </div>;
    },
  };
};
