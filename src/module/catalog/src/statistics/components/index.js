import m from 'mithril';
import './index.scss';
import Dropdown from 'catalog/dropdown';

export default (vnode) => {
  return {
    view(vnode) {
      return (
        <div>
          <p>Here you can find <span> distribution statistics</span></p>
          <p>Time frame</p>
          <Dropdown></Dropdown>
        </div>
      );
    },
  };
};
