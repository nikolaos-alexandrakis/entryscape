import './index.scss';

export default () => ({
  view(vnode) {
    const buttonContent = vnode.children;
    const { onclick } = vnode.attrs;

    return (
      <button class={` btn btn-raised ${vnode.attrs.class}`} onclick={onclick}>
        <span>{buttonContent}</span>
      </button>
    );
  },
});
