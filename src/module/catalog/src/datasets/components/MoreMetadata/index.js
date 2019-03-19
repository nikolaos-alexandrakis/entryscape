import './index.scss';

/**
 * Displays an extended view of metadata
 *
 * @returns {object} A Mithril component
 */
export default () => ({
  view(vnode) {
    const { isHidden } = vnode.attrs;
    const hiddenClass = isHidden ? 'hidden' : '';

    return (
      <div class={`metadata--more ${hiddenClass}`}>
      </div>
    );
  },
});
