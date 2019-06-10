import escoListNLS from 'commons/nls/escoList.nls';
import escaPreparationsNLS from 'catalog/nls/escaPreparations.nls';
import Dropdown from 'commons/components/common/Dropdown';
import Button from 'commons/components/Button';
import { i18n } from 'esi18n';
// import bindActions from './actions';

/**
 * Renders a list of action buttons that can be applied to a Suggestion
 *
 * @returns {Mithril.Component}
 */
export default (vnode) => {
  const { suggestion, refresh = () => {} } = vnode.attrs;
  // const actions = bindActions(distribution, dataset, DOMUtil.preventBubbleWrapper);

  return {
    view(vnode) {
      const escaPreparations = i18n.getLocalization(escaPreparationsNLS);
      const escoList = i18n.getLocalization(escoListNLS);

      return (
        <div class=" icon--wrapper">
          <Dropdown>
            <Button>{escoList.editEntry}</Button>
            <Button>{escaPreparations.linkDatasetMenu}</Button>
            <Button>{escaPreparations.createDatasetMenu}</Button>
            <Button>{escaPreparations.commentMenu}</Button>
            <Button>{escaPreparations.archiveMenu}</Button>
            <Button>{escaPreparations.deleteMenu}</Button>
          </Dropdown>
        </div>
      );
    },
  };
};
