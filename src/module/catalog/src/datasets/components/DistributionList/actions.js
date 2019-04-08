import CreateDistribution from 'catalog/datasets/CreateDistribution';
import DOMUtil from 'commons/util/htmlUtil';

export default (entry) => {
  const openCreateDialog = (onDone) => {
    const createDialog = new CreateDistribution({}, DOMUtil.create('div'));
    // @scazan Some glue here to communicate with RDForms without a "row"
    createDialog.open({ row: { entry }, onDone: () => onDone(entry) });
  };

  return {
    openCreateDialog,
  };
};
