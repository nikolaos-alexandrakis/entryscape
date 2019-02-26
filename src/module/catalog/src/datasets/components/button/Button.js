import m from 'mithril';
import './Button.scss';


const ButtonComponent = (vnode) => {
  return {
    view(vnode) {
      const buttonContent = vnode.children;
      return (
        <button>
          {buttonContent}
        </button>
      );
    },
  };
};