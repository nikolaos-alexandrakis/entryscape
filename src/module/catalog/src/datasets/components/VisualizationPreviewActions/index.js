import { getEntryRenderName } from 'commons/util/entryUtil';
import './index.scss';

export default () => {
  return {
    view(vnode) {
      const { configurationEntry, onclickEdit, onclickRemove } = vnode.attrs;
      const name = getEntryRenderName(configurationEntry);
      return <div className="chart__actions">
        <h5>{name}</h5>
        <div>
          <button className="btn btn-secondary fas fa-edit" onclick={onclickEdit}/>
          <button className="btn btn-secondary fas fa-times" onclick={() => onclickRemove(configurationEntry)}/>
        </div>
      </div>;
    },
  };
};
