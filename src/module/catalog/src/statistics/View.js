import BootstrapDropdown from 'commons/components/bootstrap/Dropdown';
import InlineList from 'commons/components/bootstrap/InlineList';
import { createSetState } from 'commons/util/util';
import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import DistributionList from './components/DistributionList';
import APICallList from './components/APICallList';
import Pagination from 'commons/components/bootstrap/Pagination';
import './index.scss';
import m from 'mithril';


/**
 * @todo @valentino localize
 * @return {string[]}
 */
const getLocalizedTimeRanges = () => [
  'Today',
  'Yesterday',
  'Last 7 days',
  'Last 14 days',
  'Last 30 days',
  'More preset rangs',
  '-', // denotes li.divider
  'Custom',
];

const getTabs = () => [
  {
    label: 'Files',
    icon: 'fa-file',
    component: {
      class: DistributionList,
    },
  },
  {
    label: 'API calls',
    icon: 'fa-repeat',
    component: {
      class: APICallList,
    },
  },
];

export default declare(MithrilView, {
  mainComponent: () => {
    const state = {
      activeTimeRangeIdx: 0,
      activeTabIdx: 0,
      customTimeRange: {
        start: '',
        end: '',
      },
    };

    const setState = createSetState(state);

    const onclickTab = (e) => {
      console.log(e.currentTarget.dataset.tab);

      setState({
        activeTabIdx: parseInt(e.currentTarget.dataset.tab, 10),
      });
    };

    const onclickTimeRange = (e) => {
      setState({
        activeTimeRangeIdx: parseInt(e.currentTarget.dataset.range, 10),
      });
    };

    return {
      view(vnode) {
        const timeRanges = getLocalizedTimeRanges();
        const tabs = getTabs();
        const ListComponent = tabs[state.activeTabIdx].component.class;
        return (
          <div className="">
            <div className="">
              <h3>Here you can find some <span>info about stats</span></h3>
            </div>
            <section className="stats__wrapper">
              <div className="data__wrapper">
                <div className="chooser__wrapper">
                  <h4>Time frame</h4>
                  <BootstrapDropdown items={timeRanges} selected={state.activeTimeRangeIdx} onclick={onclickTimeRange}/>
                </div>
                <div className="distributions__wrapper">
                  <div class="distributionList__tabs">
                    <InlineList items={tabs} selected={state.activeTabIdx} onclick={onclickTab}/>
                  </div>
                  <div className="distributionList">
                    <ListComponent />
                  </div>
                </div>
                <nav>
                  <Pagination/>
                </nav>

              </div>
              <div className="visualization__wrapper">
                <h4>Catalog/Distribution statistics for <span>2018</span></h4>
                <div className="visualization__chart"></div>
              </div>
            </section>
          </div>
        );
      },
    };
  },
});

