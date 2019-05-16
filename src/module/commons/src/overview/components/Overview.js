import m from 'mithril';
import DescriptionList from './DescriptionList';
import StatBoxList from './StatBoxList';
import '../overview.scss';

const Overview = {
  view(vnode) {
    const { sList, bList } = vnode.attrs.data;

    return m('div', [
      m('.escoOverview__main', [
        m('', [
          m('.escoOverview__wrapper', [
            m('.escoOverview__termFact', m(DescriptionList, { sList })),
          ]),
        ]),
        m('', [
          m('.escoOverview__wrapper', m(StatBoxList, { bList })),
        ]),
      ]),
    ]);
  },
};

export default Overview;
