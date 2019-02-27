import m from 'mithril';

export default () => ({
  view(vnode) {
    const { isEnabled, onToggle } = vnode.attrs;
    const enabledClass = isEnabled ? '' : 'fa-rotate-180';

    return (
      <button class={`fa fa-toggle-on fa-lg  btn--publish ${enabledClass}`} onclick={onToggle} ></button>
    );
  },
});
