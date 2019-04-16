import m from 'mithril';
import { createSetState } from 'commons/util/util';
import './index.scss';

export default (vnode) => {
  const state = {
    isShowing: false,
  };

  const setState = createSetState(state);

  const hideFileDropdown = () => {
    setState({
      isShowing: false,
    });
    vnode.dom.classList.remove('dropup');
  };

  const handleOutsideClick = () => {
    hideFileDropdown();
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setState({
      isShowing: !state.isShowing,
    });
  };


  const setDropdownOrientation = () => {
    const dropdownElement = vnode.dom.querySelector('.row__dropdownMenu');
    const dropdownHeight = dropdownElement.offsetHeight;
    const toggleButton = vnode.dom.querySelector('.dropdown-toggle');
    const toggleButtonHeight = toggleButton.offsetHeight;
    const dropdownScreenPositionY = toggleButton.getBoundingClientRect().top;

    const siteFooter = document.querySelector('.bottom_footer').clientHeight;

    const spaceAbove = dropdownScreenPositionY;
    const spaceBelow = Math.abs(window.innerHeight - dropdownScreenPositionY) - siteFooter;
    const elementHeight = toggleButtonHeight + dropdownHeight;

    if ((spaceBelow < elementHeight) && (spaceAbove > spaceBelow)) {
      dropdownElement.classList.add('dropup');
    }
  };

  return {
    view(vnode) {
      const { children } = vnode;
      const showingDropdownClass = state.isShowing ? 'ESshow' : '';

      return (
        <div>
          <button class="icons fa fa-cog dropdown-toggle" onclick={toggleDropdown} onblur={handleOutsideClick}></button>
          <div class={`row__dropdownMenu ${showingDropdownClass}`}>
            { children }
          </div>
        </div>
      );
    },
    onupdate() {
      if (state.isShowing) {
        setDropdownOrientation();
      }
    },
  };
};
