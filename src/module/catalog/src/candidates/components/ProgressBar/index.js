import './index.scss';

export default () => ({
  view(vnode) {
    const { progressPercent = 0, clickHandler } = vnode.attrs;

    return (
      <div class="progressBar" onclick={clickHandler}>
        <div class="bar">
          <div class="indicator">
            {progressPercent}
          </div>
        </div>
      </div>
    );
  },
});
