import { createSetState } from 'commons/util/util';
import { i18n } from 'esi18n';
import { namespaces } from 'rdfjson';
import esteConceptNLS from 'terms/nls/esteConcept.nls';
import skosUtil from 'commons/tree/skos/util';
import './style.css';

/**
 * @param initalVnode
 * @return {{view(): *, oninit(): void}|*}
 */
export default (initalVnode) => {
  const {
    /** @type {store/Entry} */ entry,
  } = initalVnode.attrs;

  const state = {
    isEditMode: null,
    namespace: '',
    localName: '',
  };
  const setState = createSetState(state);

  /**
   * toggle between edit and view mode
   */
  const changeMode = () => {
    setState({
      isEditMode: !state.isEditMode,
    });
  };

  const updateConceptLocalName = async () => {
    const newNode = initalVnode.dom.getElementsByTagName('input')[0];
    const localName = newNode.value;

    await skosUtil.updateConceptResourceURI(entry, state.namespace + localName);

    setState({
      isEditMode: false,
      localName,
    });
  };

  return {
    oncreate() {
      const { localname: localName, ns: namespace } = namespaces.nsify(entry.getResourceURI());
      console.log(localName, namespace);

      setState({
        isEditMode: false,
        namespace,
        localName,
      });
    },
    view() {
      const esteConcept = i18n.getLocalization(esteConceptNLS);
      const { isEditMode, namespace, localName } = state;
      console.log(namespace);

      return <div class='form-group concept-uri'>
        <label>{esteConcept.termURI}</label>
        {isEditMode ?
          <div className='input-group'>
            <span className='input-group-addon'>{namespace}</span>
            <input type='text' className='form-control' placeholder={localName} aria-describedby='sizing-addon2'/>
            <span className='input-group-btn'>
              <button className='btn btn-default' type='button' onclick={updateConceptLocalName}>
                <i className='fa fa-check' aria-hidden='true'/>
              </button>
            </span>
          </div> :
          <div className=''>
            <div className=''>
              <span>{namespace + localName}</span>
              <a className='edit-action spaExplicitLink' onclick={changeMode}>
                <i className='fa fa-edit' aria-hidden='true'/>
              </a>
            </div>
          </div>
        }
      </div>;
    },
  };
};
