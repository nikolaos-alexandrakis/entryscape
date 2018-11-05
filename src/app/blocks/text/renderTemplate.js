define([
  '../utils/filter',
  '../boot/params',
  '../boot/handlebars',
  '../utils/getEntry',
], (filter, params, handlebars, getEntry) =>
  (node, data) => {
    filter.guard(node, data.if);
    getEntry(data, entry => handlebars.run(node, data, null, entry));
  });
