import registry from 'commons/registry';
import 'jquery';
import { parseCSVFile } from 'catalog/datasets/utils/visualizationUtil';

const showTable = (tnode, entry, prop) => {
  const md = entry.getMetadata();
  parseCSVFile(md.findFirstValue(entry.getResourceURI(), prop)).then((data) => {

    const columns = data.meta.fields.map((value) => ({
      field: value,
      title: value,
      filter: {
        type: 'input',
      },
    }));

    jquery(tnode).bootstrapTable({
      dataField: 'results',
      totalField: 'resultCount',
      sortable: true,
      silentSort: true,
      search: true,
      pagination: true,
      smartDisplay: true,
      showRefresh: true,
      showColumns: true,
      filter: true,
      columns,
      data: data.data,
    });
  });
};


export default (node, data) => {
  const headerNode = document.createElement('div');
  const tableNode = document.createElement('div');
  node.appendChild(headerNode);
  node.appendChild(tableNode);
  if (data.emptyLabel) {
    headerNode.innerHTML = data.tableempty;
  }
  registry.onChange(data.on, (evt) => {
    // node.innerHTML = evt.entry.getId();
    if (data.expandLabel) {
      const expandButton = document.createElement('button');
      expandButton.innerHTML = data.expandLabel;
      node.appendChild(expandButton);
      expandButton.click = () => {
        headerNode.innerHTML = data.label || '';
        expandButton.destroy();
        showTable(tableNode, evt.entry, data.prop);
      };
    } else {
      headerNode.innerHTML = data.label || '';
      showTable(tableNode, evt.entry, data.prop);
    }
  });

/*  const headerItems = [];
  jquery.each(data.columnnames, (idx, value) => {
    headerItems.push({
      field: value,
      title: value,
      filter: { type: 'input' },
    });
  });*/
};
