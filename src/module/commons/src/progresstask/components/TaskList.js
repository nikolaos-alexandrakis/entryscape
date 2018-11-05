import Task from './Task';
import m from 'mithril';

const TaskList = {
  bid: 'escoProgressTask',
  view(vnode) {
    const { tasks } = vnode.attrs;
    return m('.progress', { class: `${this.bid}__progressbarDiv` }, tasks.map(task => m(Task, { task })));
  },
};

export { TaskList };
export default TaskList;
