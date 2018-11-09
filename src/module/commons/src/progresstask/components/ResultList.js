import m from 'mithril';
import Result from './Result';

const ResultList = {
  view(vnode) {
    const { tasks } = vnode.attrs;

    return m('ul.list-group', tasks.map(result => m(Result, { result })));
  },
};

export default ResultList;
