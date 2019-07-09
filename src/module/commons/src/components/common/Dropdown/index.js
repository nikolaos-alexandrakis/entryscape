import m from 'mithril';
import { createSetState } from 'commons/util/util';
import './index.scss';

export default (vnode) => {
  const state = {
    isShowing: false,
  };

  const setState = createSetState(state);

  const hideFileDropdown = () => {
    if (state.isShowing) {
      setState({
        isShowing: false,
      });
    }

    vnode.dom.classList.remove('dropup');
  };


  const toggleDropdown = (e) => {
    e.preventDefault();

    // Push the change to the end of the event loop so the window click event
    // will be able to test isShowing correctly
    setTimeout(() => setState({
      isShowing: !state.isShowing,
    }), 0);
  };

  const setDropdownOrientation = () => {
    const dropdownElement = vnode.dom.querySelector('.row__dropdownMenu');
    const dropdownHeight = dropdownElement.offsetHeight;
    const toggleButton = vnode.dom.querySelector('.icons');
    const toggleButtonHeight = toggleButton.offsetHeight;
    const dropdownScreenPositionY = toggleButton.getBoundingClientRect().top;

    // const siteFooter = document.querySelector('.bottom_footer').clientHeight;
    // @scazan DANGER: The footer height was previously sized at 40px in CSS and the above took care of that,
    // but the height was removed on Althea's last day and I'm not sure why.
    // To avoid any cascading issues setting this manually here for now.
    const siteFooter = 40;

    const spaceAbove = dropdownScreenPositionY;
    const spaceBelow = Math.abs(window.innerHeight - dropdownScreenPositionY) - siteFooter;
    const elementHeight = toggleButtonHeight + dropdownHeight;

    if ((spaceBelow < elementHeight) && (spaceAbove > spaceBelow)) {
      dropdownElement.classList.add('dropup');
    }
  };

  return {
    oninit() {
      window.addEventListener('click', hideFileDropdown);
    },

    onremove() {
      window.removeEventListener('click', hideFileDropdown);
    },

    view(vnode) {
      const { children } = vnode;
      const showingDropdownClass = state.isShowing ? 'ESshow' : '';

      return (
        <div className='ESDropdown'>
          <button class="icons fas fa-cog" onclick={toggleDropdown} ></button>
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
