import m from 'mithril';
import Task from './Task';

const TaskList = {
  bid: 'escoProgressTask',
  view(vnode) {
    const { tasks } = vnode.attrs;
    return m('.progress', { class: `${this.bid}__progressbarDiv` }, tasks.map(task => m(Task, { task })));
  },
};

export default TaskList;
