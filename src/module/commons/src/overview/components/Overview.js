import m from 'mithril';
import OverviewHeader from './OverviewHeader';
import DescriptionList from './DescriptionList';
import StatBoxList from './StatBoxList';
import '../overview.scss';

const Overview = {
  view(vnode) {
    const { title, description, sList, bList } = vnode.attrs.data;

    return m('.escoOverview__main', [
      m(OverviewHeader, { title, description }),
      m('.escoOverview__wrapper', [
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
