import DOMUtil from 'commons/util/htmlUtil';
define([
    'entryscape-blocks/utils/getEntry',
], function(getEntry, getTextContent) {

    return function(node, data, items) {
        getEntry(data, function(entry) {
            node.innerHTML = '';
            var src;
            if (data.property) {
                src = entry.getMetadata().findFirstValue(entry.getResourceURI(), data.property);
            } else {
                src = entry.getResourceURI();
            }

            const _node = DOMUtil.create('img', {src: src });
            node.appendchild(_node);

            _node.onerror = error => {
               if (data.fallback) {
                 _node.src = data.fallback;                 
               }
            };

            if (data.width) {
                _node.style.width = data.width;
            }
            if (data.height) {
                _node.style.height = data.height;
            }
        });
    };
});
