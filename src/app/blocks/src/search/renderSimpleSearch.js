import DOMUtil from 'commons/util/htmlUtil';
import filter from 'blocks/utils/filter';
import registry from 'commons/registry';

export default (node, data) => {
  /**
   * Renders a search input field. The typed search term will be used as a constraint by the
   * search component.
   */

  if (typeof data.width !== 'undefined') {
    node.style.width = data.width;
  }
  node.classList.add('block_searchInput');
  let t;
  let term;
  let lock = false;
  const minimumSearchLength = registry.get('blocks_minimumSearchLength') || 3;

  const input = DOMUtil.create('input', {
    type: 'text',
    class: 'form-control',
    placeholder: data.placeholder,
    title: data.placeholder,
  });
  let inputgroup;
  if (data.formGroup || data.searchButton) {
    inputgroup = DOMUtil.create('span', { class: 'input-group' });
    node.appendChild(inputgroup);
    inputgroup.appendChild(input);
  } else {
    node.appendChild(input);
  }
  if (data.searchButton) {
    const inputGroupButtonEl = DOMUtil.create('span', { class: 'input-group-btn' });
    inputgroup.appendChild(inputGroupButtonEl);
    const button = DOMUtil.create('button', { class: 'btn btn-default' }, inputGroupButtonEl);
    DOMUtil.create('span', { 'aria-hidden': true, class: 'fa fa-search' }, button);
    button.onclick = () => {
      let newTerm = input.value;
      newTerm = newTerm === undefined || newTerm.length < minimumSearchLength ? undefined :
        { value: newTerm, group: data.collection || 'term' };
      lock = true;
      filter.replace(term, newTerm);
      term = newTerm;
      lock = false;
    };
  }
  input.onkeyup = () => {
    if (t != null) {
      clearTimeout(t);
    }
    t = setTimeout(searchTriggered, 300);
  };
  registry.onChange('blocks_search_filter', (filters) => {
    if (lock) {
      // If the filter is itself making the change
      return;
    }
    lock = true;
    let newValue = '';
    const newValueArr = filters[data.collection || 'term'];
    if (newValueArr && newValueArr.length > 0) {
      newValue = newValueArr[0].value;
    }
    const existingValue = input.value;

    if (newValue !== existingValue) {
      input.setAttribute('value', newValue);
    }
    lock = false;
  }, true);
};
