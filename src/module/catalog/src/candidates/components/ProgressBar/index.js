import './index.scss';

export default () => ({
  view(vnode) {
    const { progressPercent = 0, incomplete = true, clickHandler } = vnode.attrs;

    return (
      <div class="progressBar" onclick={clickHandler}>
        <div class="progress bar">
          <div
            class={`progress-bar ${incomplete && 'incomplete'}`}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
            style={`width: ${progressPercent}%`}
          >
          </div>
        </div>
      </div>
    );
  },
});
