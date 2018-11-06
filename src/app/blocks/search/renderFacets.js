import DOMUtil from 'commons/util/htmlUtil';

define([
    'dojo/_base/declare',
    'dojo/on',
    'rdfjson/namespaces',
    'md5',
    'entryscape-blocks/boot/params',
    'entryscape-commons/defaults',
    'entryscape-blocks/utils/labels',
    'entryscape-blocks/utils/filter',
    'jquery',
], function (declare, on, namespaces, md5, params, defaults,
             labels, filter, jquery) {
    let rdfutils = defaults.get('rdfutils');

    let FacetBlock = declare(null, {
        constructor: function(facetDef, node) {
            this.def = facetDef;
            this.domNode = DOMUtil.create('div', { 'class': 'block_facet collection_'+facetDef.name });
            node.appendChild(this.domNode);
            this.headerNode = DOMUtil.create('h3', { innerHTML: this.def.label });
            this.domNode.appendChild(this.headerNode);
            this.bodyNode =  DOMUtil.create('ul');
            this.domNode.appendChild(this.bodyNode);
            this.viewAllNode = DOMUtil.create('button',
              {class: 'btn btn-default pull-right',
              innerHTML: 'visa alla'});
              this.viewAllNode.style.display = 'none';
              this.domNode.appendChild(this.viewAllNode);
            const self = this;
            on(this.viewAllNode, 'click', () => {
              if (self.def.loadedLimit > 0) {
                self.def.changeLoadLimit();
              } else {
                self.def.changeLoadLimit(self.def.limit);
              }
            })
            this.collectionName = 'blocks_collection_'+facetDef.name;
            defaults.onChange(this.collectionName, this.renderCollection, true).bind(this);
        },

        renderCollection: function(collectionDef) {
            if (collectionDef.list) {
              this.render(collectionDef.list, defaults.get('blocks_search_filter') || {});
            }
        },
        renderFiltersUpdate: function(filters) {
            let collection = defaults.get(this.collectionName);
            if (collection) {
                this.render(collection, filters);
            }
        },
        render: function(collection, filters) {
            this.renderExpand(collection);
            const selectedItems = this.getSelectedItems(collection, filters);
            this.bodyNode.innerHTML = '';

            if (this.selectedMissingInCollection(selectedItems, filters)) {
                //Things missing in collection, only show selectedItems.
            } else {
                collection.forEach(function(item) {
                    this.drawOption(item, selectedItems.indexOf(item) !== -1);
                }, this);
            }
        },

        renderExpand: function(collection) {
          if (typeof this.def.limit === 'undefined' || (this.def.limit > 0 &&
              collection.length < this.def.limit)) {
              // Nothing to expand
            this.viewAllNode.style.display = 'none';
          } else if (this.def.loadedLimit > 0) {
            this.viewAllNode.innerHTML = 'visa fler';
            this.viewAllNode.style.display = 'inline-block';
          } else {
            this.viewAllNode.innerHTML = 'visa färre';
            this.viewAllNode.style.display = 'inline-block';
          }
        },

        selectedMissingInCollection: function(selectedItems, filters) {
            return false;
            /*let cfilter;
            if (filters && filters[this.def.name]) {
                cfilter = filters[this.def.name];
            }
            return cfilter && cfilter.length > selectedItems.length;*/
        },
        getSelectedItems: function(collection, filters) {
            let selectedItems = [];
            let cfilter;
            if (filters && filters[this.def.name]) {
                cfilter = filters[this.def.name];
                collection.find(function(item) {
                    cfilter.forEach(function(fvalue) {
                        if (item.value === fvalue.value) {
                            selectedItems.push(item);
                        }
                    });
                });
            }
            return selectedItems;
        },
        drawOption: function(item, selected) {
            const md = md5(item.value);
            let li = DOMUtil.create('li', {class: selected ? 'selected md5_' + md : 'md5_' + md});
            this.bodyNode.appendChild(li);
            li.appendChild(DOMUtil.create('span', {innerHTML: item.label, class: 'facetLabel' }));
            if (item.occurence) {
                li.appendChild(DOMUtil.create('span', {class: 'occurence', innerHTML: '(' + item.occurence + ')' }));
            }
            if (selected) {
                let button = DOMUtil.create('button', {class: 'btn btn-small btn-link'});
                li.appendChild(button);
                button.appendChild(DOMUtil.create('i', {class: 'fa fa-remove' }));
                
                on(button, 'click', function(e) {
                    e.stopPropagation();
                    filter.remove(item);
                })
            }
            on(li, 'click', function() {
                filter.add(item);
            });
        }
    });

  return (node, data, items) => {
    defaults.onChange('blocks_collections', (collections) => {
      collections.forEach((collection) => {
        if (collection.includeAsFacet) {
          new FacetBlock(collection, node);
        }
      });
    }, true);
  };
});
