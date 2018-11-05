import OverviewHeader from './OverviewHeader';
import DescriptionList from './DescriptionList';
import StatBox from './StatBox';
import m from 'mithril';
import '../overview.css';

const Overview = {
  view(vnode) {
    const { title, description, sList, bList } = vnode.attrs.data;

    return m('div', [
      m(OverviewHeader, { title, description }),
      m('.row', [
        m('.col-md-6', [
          m('.well', [
            m('.escoOverview__termFact', m(DescriptionList, { sList })),
          ]),
        ]),
        m('.col-md-6', [
          m('.well', m(StatBox, { bList })),
        ]),
      ]),
    ]);
  },
};

export { Overview };
export default Overview;
