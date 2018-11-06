import DOMUtil from 'commons/util/htmlUtil';
define([
    'dojo/_base/declare',
    './List',
    'entryscape-commons/list/EntryRow',
    './MetadataExpandRow',
    'entryscape-commons/defaults',
    'entryscape-commons/store/ArrayList',
], function(declare, lang, List, EntryRow, MetadataExpandRow, defaults, ArrayList) {

    const _CatalogRowMixin = declare([], {
        showCol1: true,
        showCol3: false,
        renderCol1: function() {
            this.col1Node.style.textAlign = 'left';
            this.col1Node.innerHTML = '<span class="badge">' + this.entry.__nrOfDatasets + '</span>';
        },
        updateLocaleStrings: function() {
            this.inherited(arguments);
            this.renderCol1();
        }
    });

    let CatalogList = declare([List], {
        updateRowClass: function() {
            if (this.conf.template != null) {
                this.rowClass = declare([MetadataExpandRow, _CatalogRowMixin], {});
                return true;
            } else {
                this.rowClass = declare([EntryRow, _CatalogRowMixin], {});
            }
        },

        search: function() {
            const catalogs = [];
            defaults.get('entrystore').newSolrQuery()
                .rdfType('dcat:Catalog').uriProperty('dcat:dataset', '[* TO *]')
                .list().forEach(function(catalogEntry) {
                catalogEntry.__nrOfDatasets = catalogEntry.getMetadata().find(catalogEntry.getResourceURI(), 'dcat:dataset').length;
                catalogs.push(catalogEntry);
            }).then(function() {
                catalogs.sort(function(c1, c2) {
                    return c1.__nrOfDatasets < c2.__nrOfDatasets ? 1 : -1;
                });
                this.listView.showEntryList(new ArrayList({arr: catalogs}));
            }.bind(this));
        }
    });

    return function(node, data, items) {
        const cl = new CatalogList({conf: data, itemstore: items},DOMUtil.create('div'));

        cl.show();
    };
});
