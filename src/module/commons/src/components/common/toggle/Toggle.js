import './index.scss';

export default () => ({
  view(vnode) {
    const {
      toggleState = false,
      onToggle,
      title,
      isEnabled = true,
    } = vnode.attrs;
    const disabledClass = isEnabled ? '' : 'disabled';
    const toggledOnClass = toggleState ? '' : 'fa-rotate-180';

    return (
      <button
        class={`fas fa-toggle-on fa-lg btn--publish ${disabledClass} ${toggledOnClass}`}
        title={title}
        onclick={isEnabled ? onToggle : undefined}
      ></button>
    );
  },
});
