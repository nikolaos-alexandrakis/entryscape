import DOMUtil from 'commons/util/htmlUtil';
define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'entryscape-blocks/utils/getEntry',
    'entryscape-commons/list/EntryRow',
    './MetadataExpandRow',
    'entryscape-commons/defaults',
    './List',
    './formats',
    'i18n!nls/escoList',
    'i18n!nls/escaDataset',
], function (declare, array, lang, getEntry, EntryRow, MetadataExpandRow, defaults, List, formats) {

    let _FormatRowMixin = declare([], {
        showCol1: true,
        showCol3: false,
        renderCol1: function() {
            this.col1Node.style.textAlign = 'left';
            let format = this.entry.getMetadata().findFirstValue(this.entry.getResourceURI(), 'dcterms:format') || this.entry.getEntryInfo().getFormat(),
                abbrev = formats(format);
            this.col1Node.setAttribute('innerHTML', '<span class="label label-success">' + abbrev
            + '</span>');
            this.col1Node.setAttribute('title', format);
        },

        // Adapted from renderTitle in entryscape-commons/dataset/DistributionRow.js
        getRenderName() {
            const md = this.entry.getMetadata();
            const subj = this.entry.getResourceURI();
            const title = md.findFirstValue(subj, 'dcterms:title');
            const downloadURI = md.findFirstValue(subj, 'dcat:downloadURL');
            const source = md.findFirstValue(subj, 'dcterms:source');
            if (this.list.NLSBundles.escaDataset && title == null) {
                if (downloadURI != null && downloadURI !== '') {
                    return this.list.NLSBundles.escaDataset.defaultDownloadTitle;
                } else if (source != null && source !== '') {
                    return this.list.NLSBundles.escaDataset.autoGeneratedAPI;
                } else {
                    return this.list.NLSBundles.escaDataset.defaultAccessTitle;
                }
            }
            return title;
        },

        updateLocaleStrings: function() {
            this.inherited(arguments);
            this.renderCol1();
        }
    });

    let FormatList = declare([List], {
        nlsBundles: ['escoList', 'escaDataset'],

        updateRowClass: function() {
            if (this.conf.template != null) {
                this.rowClass = declare([MetadataExpandRow, _FormatRowMixin], {});
                return true;
            } else {
                this.rowClass = declare([EntryRow, _FormatRowMixin], {});
            }
        }
    });

    return function(node, data, items) {
        let obj = lang.clone(data);
        delete obj.relation;
        let formatList;
        getEntry(obj, function(entry) {
            if (formatList) {
                formatList.destroy();
            }
            formatList = new FormatList({conf: data, itemstore: items, entry: entry }, DOMUtil.create('div'));
            node.appendChild(formatList);
            formatList.show();
        });
    };
});