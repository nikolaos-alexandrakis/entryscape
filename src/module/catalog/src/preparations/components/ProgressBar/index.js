import './index.scss';

export default () => ({
  view(vnode) {
    const { progressPercent = 0, incomplete = true, onclick, className = '' } = vnode.attrs;

    return (
      <div className={`progressBar ${className}`} onclick={onclick}>
        <div className="progress bar">
          <div
            className={`progress-bar ${incomplete && 'incomplete'}`}
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
