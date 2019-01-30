import m from 'mithril';

export default () => ({
  view(vnode) {
    const { isPublish, isInternalPublish, onToggle } = vnode.attrs;
    const publishClass = isPublish ? '' : 'fa-rotate-180';

    return (
      <button class={`fa fa-toggle-on fa-lg  btn--publish ${publishClass}`} onclick={onToggle} ></button>
    );
  },
});
