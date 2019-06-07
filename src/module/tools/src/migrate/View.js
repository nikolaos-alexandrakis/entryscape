import { namespaces } from 'rdfjson';
import { promiseUtil } from 'store';
import registry from 'commons/registry';
import MithrilView from 'commons/view/MithrilView';
import declare from 'dojo/_base/declare';
import EntrySearchSelect from 'commons/components/entry/select/EntrySearchSelect';
import Button from 'commons/components/common/button/Button';
import Select from 'commons/components/common/form/Select';
import Alert from 'commons/components/common/alert/Alert';
import Input from 'commons/components/common/form/Input';
import { createSetState } from 'commons/util/util';
import Entry from './components/Entry';
import './index.scss';

namespaces.add('store', registry.get('entrystore').getBaseURI());

const nodeTypes = [
  'Object as literal',
  'Object as URI',
  'Object as language literal',
  'Object as datatyped literal',
];
export default declare(MithrilView, {
  mainComponent: () => {
    const state = {
      migratingMessage: '',
      context: null,
      entries: [],
      hasLanguage: false,
      hasDatatype: false,
      nodeType: 'literal', // OR uri
      nodeTypeIdx: 0,
      rdfType: '',
      from: { s: '', p: '', o: '', d: '', l: '' }, // (s)ubject, (p)redicate, (o)bject, (d)atatype, (l)anguage
      to: { s: '', p: '', o: '', d: '', l: '' },
    };

    const setState = createSetState(state);
    const onSelect = entry => setState({ context: entry });
    const es = registry.get('entrystore');
    const contextSearch = term => es.newSolrQuery().context('_contexts').title(term).limit(10)
      .getEntries();
    const entryQuery = () => {
      const query = es.newSolrQuery();
      if (state.from.p !== '') {
        const obj = state.from.o !== '' ? state.from.o : '*';
        if (state.nodeType === 'literal') {
          query.literalProperty(state.from.p, obj);
        } else {
          query.uriProperty(state.from.p, obj);
        }
      } else {
        query.title('*');
      }
      if (state.from.s !== '') {
        query.resource(state.from.s);
      }

      if (state.rdfType !== '') {
        query.rdfType(state.rdfType);
      }
      if (state.context) {
        query.context(state.context);
      }
      return query;
    };
    const searchClicked = () => {
      entryQuery().getEntries().then((entries) => {
        setState({ entries });
      });
    };

    const nodeTypeChange = (ev) => {
      const val = ev.currentTarget.value;
      if (val === nodeTypes[0]) {
        setState({ hasLanguage: false, hasDatatype: false, nodeType: 'literal', nodeTypeIdx: 0 });
      } else if (val === nodeTypes[1]) {
        setState({ hasLanguage: false, hasDatatype: false, nodeType: 'uri', nodeTypeIdx: 1 });
      } else if (val === nodeTypes[2]) {
        setState({ hasLanguage: true, hasDatatype: false, nodeType: 'literal', nodeTypeIdx: 2 });
      } else if (val === nodeTypes[3]) {
        setState({ hasLanguage: false, hasDatatype: true, nodeType: 'literal', nodeTypeIdx: 3 });
      }
    };
    const fix = () => {
      setState({ migratingMessage: `Starting to change ${state.entries.length} entries` });
      const arr = [];
      entryQuery().forEach(e => arr.push(e)).then(() => {
        let idx = 0;
        promiseUtil.forEach(arr, (e) => {
          if (idx !== 0) {
            setState({ migratingMessage: `Changed ${idx} of ${state.entries.length} entries` });
          }
          idx += 1;
          const s = state.from.s === '' ? null : state.from.s;
          const p = state.from.p === '' ? null : state.from.p;
          const o = state.from.o === '' ? null : { value: state.from.o, type: state.nodeType };
          if (state.hasDatatype) {
            o.datatype = state.d;
          }
          if (state.hasLanguage) {
            o.lang = state.l;
          }
          const md = e.getMetadata();
          md.find(s, p, o).forEach((stmt) => {
            if (state.to.p !== '') {
              stmt.setPredicate(state.to.p);
            }
            if (state.to.o !== '') {
              stmt.setValue(state.to.o);
            }
            if (state.hasLanguage && state.to.l !== '') {
              stmt.setLanguage(state.to.l);
            }
            if (state.hasDatatype && state.to.d !== '') {
              stmt.setDatatype(state.to.d);
            }
          });
          if (md.isChanged()) {
            return e.commitMetadata();
          }
          return Promise.resolve();
        }).then(() => {
          setState({ migratingMessage: '', entries: [] });
        });
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
              <h3>Migrate triples in entries</h3>
            </div>
            <section className="migrate__filter">
              <div className="form-group selectizeException migrate__filter-block">
                <label className="migrate__filter-label">Filter by project:</label>
                <div className="migrate__selectize form-control">
                  <EntrySearchSelect entrySearch={contextSearch} onSelect={onSelect} allowNoEntry="true"/>
                </div>
              </div>
              <div className="form-group migrate__filter-block">
                <label className="migrate__filter-label">Filter by type:</label>
                <Input input={{ classNames: ['migrate__rdftype', 'form-control'],
                  value: state.rdftype,
                  onvalue: rt => setState({ rdfType: rt }) }}/>
              </div>
              <table className="migrate__table">
                <thead>
                  <tr>
                    <th></th>
                    <th><span>Subject</span></th>
                    <th><span>Predicate</span></th>
                    <th className="migrate__object-header"><Select value={nodeTypes[state.nodeTypeIdx]}
                      options={nodeTypes} onchange={nodeTypeChange}/></th>
                    { state.hasLanguage && <th><span>Language code</span></th> }
                    { state.hasDatatype && <th><span>Datatype</span></th> }
                  </tr>
                </thead>
                <tr>
                  <td className="migrate__rowname"><label>Match</label></td>
                  <td><Input input={{ value: state.from.s, onvalue: s => setState({ from: { s } }) }}/></td>
                  <td><Input input={{ value: state.from.p, onvalue: p => setState({ from: { p } }) }}/></td>
                  <td><Input input={{ value: state.from.o, onvalue: o => setState({ from: { o } }) }}/></td>
                  { state.hasLanguage &&
                    <td><Input input={{ value: state.from.l, onvalue: l => setState({ from: { l } }) }}/></td> }
                  { state.hasDatatype &&
                    <td><Input input={{ value: state.from.d, onvalue: d => setState({ from: { d } }) }}/></td> }
                </tr>
                <tr>
                  <td className="migrate__rowname"><label>Convert to</label></td>
                  <td></td>
                  <td><Input input={{ value: state.to.p, onvalue: p => setState({ to: { p } }) }}/></td>
                  <td><Input input={{ value: state.to.o, onvalue: o => setState({ to: { o } }) }}/></td>
                  { state.hasLanguage &&
                    <td><Input input={{ value: state.to.l, onvalue: l => setState({ to: { l } }) }}/></td> }
                  { state.hasDatatype &&
                    <td><Input input={{ value: state.to.d, onvalue: d => setState({ to: { d } }) }}/></td> }
                </tr>
                <tbody>

                </tbody>
              </table>
              <Button text="Sök" onclick={searchClicked} classNames={['pull-right', 'btn-raised', 'btn-primary']}/>
            </section>
            <section className="migrate__data">
              {state.migratingMessage !== '' ? (
                <Alert type="warning" text={state.migratingMessage}/>
              ) : (
                <div>
                  {state.entries.length === 0 ?
                    <Alert text="No matching entries, refine your filter and do a new search"/> :
                    <div>
                      <table className="migrate__table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Predicate</th>
                            <th>Object</th>
                          </tr>
                        </thead>
                        {state.entries.map(entry => <Entry entry={entry} nodeType={state.nodeType}
                          from={state.from}/>)}
                      </table>
                      <Button text="Migrate" onclick={fix}
                        classNames={['pull-right', 'btn-raised', 'btn-primary']}/>
                    </div>
                  }
                </div>
              )
              }
            </section>
          </div>
        );
      },
    };
  },
});
