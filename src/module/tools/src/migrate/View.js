import registry from 'commons/registry';
import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import EntrySearchSelect from 'commons/components/entry/select/EntrySearchSelect';
import Button from 'commons/components/common/button/Button';
import { createSetState } from 'commons/util/util';
import Statement from './components/Statement';
import './index.scss';

export default declare(MithrilView, {
  mainComponent: () => {
    const state = {
      context: null,
      statements: [],
    };

    const setState = createSetState(state);
    const onSelect = entry => setState({ context: entry });
    const es = registry.get('entrystore');
    const entrySearch = term => es.newSolrQuery().context('_contexts').title(term).limit(10)
      .getEntries();
    const searchClicked = () => {
      const query = es.newSolrQuery().title('*');
      if (state.context) {
        query.context(state.context);
      }
      query.getEntries().then((arr) => {
        const stmts = arr.map(e => e.getMetadata().find(null, 'dcterms:title')[0]);
        setState({ statements: stmts });
      });
    };
    return {
      oninit() {
      },
      oncreate() {
      },
      view() {
        return (
          <div>
            <div className="migrate__title">
              <h3>Migrate</h3>
            </div>
            <section className="migrate__filter">
              <label>Filter by project:</label>
              <div className="form-control">
                <EntrySearchSelect entrySearch={entrySearch} onSelect={onSelect} allowNoEntry="true"/>
              </div>
              <label>Filter by type:</label>
              <input type="text" id="migrate__rdftype" className="migrate__input"/>
              <Button text="Sök" onclick={searchClicked} classNames={['pull-right', 'btn-raised', 'btn-primary']}/>
            </section>
            <section className="migrate__data">
              {state.statements.map(stmt => <Statement statement={stmt}/>)}
            </section>
          </div>
        );
      },
    };
  },
});
