import filter from 'blocks/utils/filter';
import handlebars from 'blocks/boot/handlebars';
import getEntry from 'blocks/utils/getEntry';

export default (node, data) => {
  filter.guard(node, data.if);
  getEntry(data, entry => handlebars.run(node, data, null, entry));
};
