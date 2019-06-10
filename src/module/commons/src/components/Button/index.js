import './index.scss';

export default () => ({
  view(vnode) {
    const buttonContent = vnode.children;
    const { onclick, title } = vnode.attrs;

    return (
      <button
        class={`btn btn-raised ${vnode.attrs.class}`}
        onclick={onclick}
        title={title}
      >
        <span>{buttonContent}</span>
      </button>
    );
  },
});
