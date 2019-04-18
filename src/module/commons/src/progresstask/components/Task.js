import m from 'mithril';

const Task = {
  bid: 'escoProgressTask',
  view(vnode) {
    const { task } = vnode.attrs;
    let className;
    switch (task.status) {
      case 'progress':
        className = '.progress-bar.bg-warning.progress-bar-striped';
        break;
      case 'done':
        className = '.progress-bar.bg-success';
        break;
      case 'failed':
        className = '.progress-bar.bg-danger.progress-bar-striped';
        break;
      default:
        className = '.progress.text-center';
    }
    return m(`${className}`, {
      key: task.id,
      class: `${this.bid}__progressbar`,
      style: { width: task.width },
    }, m('span', task.name));
  },
};

export default Task;
