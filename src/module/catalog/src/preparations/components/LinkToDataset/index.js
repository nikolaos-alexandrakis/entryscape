import './index.scss';

export default () => {
  const loadDatasets = () => {
  };

  const state = {
    datasets: [],
  };

  return {
    view(vnode) {
      const { progressPercent = 0, incomplete = true, onclick } = vnode.attrs;

      return (
        <div class="progressBar" onclick={onclick}>
          <div class="progress bar">
            <div
              class={`progress-bar ${incomplete && 'incomplete'}`}
            >
            </div>
          </div>
        </div>
      );
    },
  };
};
