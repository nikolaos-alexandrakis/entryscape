import CreateDistribution from 'catalog/datasets/CreateDistribution';
import DOMUtil from 'commons/util/htmlUtil';

export default (entry, dom) => {
  const openCreateDialog = () => {
    const createDialog = new CreateDistribution({}, DOMUtil.create('div'));
    // @scazan Some glue here to communicate with RDForms without a "row"
    createDialog.open({ row: { entry }, onDone: () => listDistributions(entry) });
  };

  return {
    openCreateDialog,
  };
};
