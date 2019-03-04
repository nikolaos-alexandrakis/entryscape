import m from 'mithril';
import { createSetState } from 'commons/util/util';

export default (vnode) => {
  const state = {
    isShowing: false,
  };

  const setState = createSetState(state);

  const hideFileDropdown = () => {
    setState({
      isShowing: false,
    });
  };

  const handleOutsideClick = (e) => {
    if (!vnode.dom.contains(e.target)) {
      hideFileDropdown();
    }
  };

  const toggleDropdown = () => {
    if (!state.isShowing) {
      document.addEventListener('click', handleOutsideClick, false);
    } else {
      document.removeEventListener('click', handleOutsideClick, false);
    }

    setState({
      isShowing: !state.isShowing,
    });
  };

  return {
    view(vnode) {
      const { children } = vnode;
      const showingDropdownClass = state.isShowing ? 'show' : '';

      return (
        <div>
          <div class="flex--sb">
            <button class="icons fa fa-cog" onclick={toggleDropdown}></button>
          </div>
          <div class={`file__dropdownMenu ${showingDropdownClass}`}>
            { children }
            BLAMMO
          </div>
        </div>
      );
    },
  };
};
