import skosUtil from 'commons/tree/skos/util';
import { createSetState } from 'commons/util/util';
import { i18n } from 'esi18n';
import { camelCase } from 'lodash-es';
import { namespaces } from 'rdfjson';
import { getUniqueConceptRURI, isConceptSchemeNamespaced } from 'terms/concept/util';
import esteConceptNLS from 'terms/nls/esteConcept.nls';
import './style.css';

/**
 * @param initalVnode
 * @return {{view(): *, oninit(): void}|*}
 */
export default (initalVnode) => {
  const {
    /** @type {store/Entry} */ conceptEntry,
    /** @type {store/Entry} */ conceptSchemeEntry,
  } = initalVnode.attrs;

  const state = {
    isEditMode: false,
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
    const namespace = isConceptSchemeNamespaced(conceptSchemeEntry);

    const newRURI = await getUniqueConceptRURI(localName, namespace);
    await skosUtil.updateConceptResourceURI(conceptEntry, newRURI);

    setState({
      isEditMode: false,
    });
  };

  return {
    view() {
      const esteConcept = i18n.getLocalization(esteConceptNLS);
      const { isEditMode } = state;
      const namespace = isConceptSchemeNamespaced(conceptSchemeEntry);
      const { localname } = namespaces.nsify(conceptEntry.getResourceURI());
      const localName = localname ||
        camelCase(conceptEntry.getMetadata().findFirstValue(conceptEntry.getResourceURI(), 'skos:prefLabel').trim());

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
              <span>{conceptEntry.getResourceURI()}</span>
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
