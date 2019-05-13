import DistributionChart from 'catalog/datasets/components/DistributionChart';
import escaStatistics from 'catalog/nls/escaStatistics.nls';
import TitleDialog from 'commons/dialog/TitleDialog';
import declare from 'dojo/_base/declare';

export default declare([TitleDialog.ContentComponent], {
  nlsBundles: [{ escaStatistics }],
  nlsHeaderTitle: 'statsDialogTitle',
  nlsFooterButtonLabel: 'statsDialogFooter',
  postCreate() {
    this.inherited(arguments);
    this.dialog.footerButtonAction = () => {
      this.hide();
    };
  },
  open(params) {
    this.dialog.show();
    const { entries } = params;
    const controllerComponent = { view: () => m(DistributionChart, { entries }) };
    this.show(controllerComponent);
  },
});
