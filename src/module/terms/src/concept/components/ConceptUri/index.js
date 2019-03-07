import { createSetState } from 'commons/util/util';
import { namespaces } from 'rdfjson';
import './style.css';


/**
 *
 * @param {store/Entry} entry
 * @return {*}
 */
export default (entry) => {
  const state = {
    isEditMode: null,
    namespace: '',
    localName: '',
    /**
     * the resource uri computed on the fly
     * @return {string}
     */
    get uri() {
      return this.namespace + this.localName;
    },
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

  const updateConceptRURI = (newLocalName) => {
    const entryInfo = entry.getEntryInfo();
    entryInfo.setResourceURI(state.namespace + newLocalName);
    return entryInfo.commit();
  };

  const updateConceptIncomingMappings = async () => {

  };

  const updateConceptLocalName = async () => {
    const oldLocalName = state.localName;
    const localNameInput = document.getElementById('concept-local-name');
    const newLocalName = localNameInput.value;

    console.log(oldLocalName, newLocalName);

    await updateConceptRURI(newLocalName);

    await updateConceptIncomingMappings();

    setState({
      isEditMode: false,
      newLocalName,
    });
  };

  /**
   * Get a vnode for previewing the resource URI of the concept
   * @param namespace
   * @param localName
   * @return {*}
   */
  const geURIFieldReadOnly = ({ namespace, localName }) => <div className='rdformsField rdformsSingleline'>
    <div className='rdformsField'>
      <span>{namespace + localName}</span>
      <a className='edit-action spaExplicitLink' onclick={changeMode}>
        <i className='fa fa-edit' aria-hidden='true'/>
      </a>
    </div>
  </div>;


  /**
   * Get a vnode for editing the localName of the concept
   * @param namespace
   * @param localName
   * @return {*}
   */
  const getURIFieldEdit = ({ namespace, localName }) => <div className='input-group rdformsField'>
    <span className='input-group-addon' id='sizing-addon2'>{namespace}</span>
    <input type='text' className='form-control' id="concept-local-name" placeholder={localName} aria-describedby='sizing-addon2'/>
    <span className='input-group-btn'>
      <button className='btn btn-default' type='button' onclick={updateConceptLocalName}>
        <i className='fa fa-check' aria-hidden='true'/>
      </button>
    </span>
  </div>;

  return {
    oninit() {
      state.isEditMode = false;
      const { localname, ns } = namespaces.nsify(entry.getResourceURI());
      state.namespace = ns;
      state.localName = localname;
    },
    view(vnode) {
      return (<div className='form-group concept-uri'>
        <div className='rdformsLabel rdformsLabelRow noPointer'>Concept URI</div>
        <div className='rdformsFields'>
          {state.isEditMode ? getURIFieldEdit(state) : geURIFieldReadOnly(state)}
        </div>
      </div>);
    },
  };
};
