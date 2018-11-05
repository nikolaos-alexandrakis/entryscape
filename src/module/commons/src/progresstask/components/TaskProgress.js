import TaskList from './TaskList';
import ResultList from './ResultList';
import m from 'mithril';
import './escoProgressTask.css';
/**
 * A component for displaying a progress dialog based on tasks and results for those tasks
 * @see ./Alert.md
 */
const TaskProgress = {
  view(vnode) {
    const { tasks } = vnode.attrs;

    return m('div', [
      m('div', m(TaskList, { tasks })),
      m('div', m(ResultList, { tasks })),
    ]);
  },
};

export { TaskProgress };
export default TaskProgress;
