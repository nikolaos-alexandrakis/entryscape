import DOMUtil from 'commons/util/htmlUtil';
define([
    'entryscape-blocks/utils/getEntry',
    'rdforms/view/Presenter',
    'rdfjson/namespaces',
], function (getEntry, Presenter, namespaces) {
    return function (node, data, items) {
        const template = items.getItem(data.rdformsid || data.template);
        getEntry(data, function(entry) {
            const fp = {};
            if (data.filterpredicates) {
                data.filterpredicates.split(',').forEach(function (p) {
                    fp[namespaces.expand(p)] = true;
                });
            }
            node.innerHTML = '');
            const presenter = new Presenter({compact: data.onecol !== true,
                filterPredicates: fp }, DOMUtil.create('div'));
                node.appendChild(presenter);
            presenter.show({
                resource: entry.getResourceURI(),
                graph: entry.getMetadata(),
                template: template,
            });
        });
    };
});