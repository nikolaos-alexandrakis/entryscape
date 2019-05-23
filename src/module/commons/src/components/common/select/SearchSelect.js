import jquery from 'jquery';
import 'selectize';

/**
 * Expects an options attribute which is an array of objects with { value, label }
 *
 * @return {{view(): *, oncreate(*): void}}
 */
export default () => ({
  oncreate(vnode) {
    const { options, selectedOptions: items = [], onChange } = vnode.attrs;
    const settings = {
      valueField: 'value',
      labelField: 'label',
      mode: 'single',
      closeAfterSelect: true,
      searchField: 'label',
      options,
      items,
      onItemAdd: onChange,
    };

    jquery(vnode.dom).selectize(settings);
  },
  view() {
    return <input type='text'/>;
  },
});
