import Row from 'commons/components/common/grid/Row';
import m from 'mithril';
import './Result.css';

const Result = {
  bid: 'escoProgressTask',
  view(vnode) {
    const { result } = vnode.attrs;
    if (result.status !== '') {
      let resultIcon;
      switch (result.status) {
        case 'progress':
          resultIcon = 'i.fa.fa-spinner.fa-spin';
          break;
        case 'done':
          resultIcon = 'i.fa.fa-check.noAnimate';
          break;
        case 'failed':
          resultIcon = 'i.fa.fa-ban';
          break;
        default:
          resultIcon = '';
      }

      return m('li.list-group-item', {
        class: `${this.bid}__resultListRow`,
        key: result.id,
      }, m('.row', [
        m('.col-md-1', m(resultIcon, { class: `${this.bid}__resultListRowIcon` })),
        m('.col-md-11', [
          m(Row,
            {
              columns: [{
                size: 12,
                value: m('span', { class: `${this.bid}__resultListRowTaskName` }, result.name),
              }],
            }), result.message ?
            m(Row, {
              columns: [{
                size: 12,
                value: m('span', { class: `${this.bid}__resultListRowSubTaskName` }, result.message),
              }],
            }) : null,
        ]),
      ]));
    }
    return null;
  },
};

export default Result;
