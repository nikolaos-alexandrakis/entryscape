import Result from './Result';
import m from 'mithril';

const ResultList = {
  view(vnode) {
    const { tasks } = vnode.attrs;

    return m('ul.list-group', tasks.map(result => m(Result, { result })));
  },
};

export { ResultList };
export default ResultList;
