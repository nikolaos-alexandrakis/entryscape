define([
    "dojo/_base/lang",
    "entryscape-blocks/boot/block",
    "handlebars",
    "jquery",
    "md5",
    "rdfjson/namespaces",
    "entryscape-commons/defaults",
    "entryscape-blocks/boot/error",
], function (lang, block, handlebars, jquery, md5, namespaces, defaults, error) {

    var currentEntry;
    var idx = [];
    var counter = 0;
    var bodycomponentId;
    var group = {};
    ["rowhead", "rowexpand", "listempty", "listhead", "listbody", "listplaceholder"].forEach(function(name) {
        handlebars.registerHelper(name, function(options) {
            group[name] = options.fn();
        });
    });

    var initializeHelpers = function() {
        block.list.forEach(function(name) {
            handlebars.registerHelper(name, function(options) {
                counter++;
                var id = "_ebh_"+counter;
                var obj = idx[idx.length-1][id] = {
                    id: id,
                    component: name,
                    options: options
                };
                if (name === 'template') {
                    options.hash.htemplate = options.fn();
                } else if (typeof options.fn === "function") {
                    group = {};
                    options.fn();
                    obj.templates = group;
                }
                return new handlebars.SafeString("<span id=\""+id+"\"></span>");
            });
        });
        handlebars.registerHelper("body", function(prop, options) {
            counter++;
            bodycomponentId = "_ebh_"+counter;
            return new handlebars.SafeString("<span id=\""+bodycomponentId+"\"></span>");
        });
        handlebars.registerHelper("ifprop", function(prop, options) {
          const props = prop.split(',');
          const stmts = [];
          props.forEach((p) => {
            const propStmts = currentEntry.getMetadata().find(currentEntry.getResourceURI(), p);
            stmts.push(...propStmts);
          });
            const invert = options.hash.invert != null;
            if (options.hash.uri || options.hash.literal) {
                const found = stmts.find((stmt) => {
                    if (options.hash.uri) {
                        return stmt.getValue() === namespaces.expand(options.hash.uri);
                    }
                    return stmt.getValue() === options.hash.literal;
                });
                if ((found && !invert) || (!found && invert)) {
                    return options.fn(options.data);
                }
            } else if ((stmts.length > 0 && !invert) || (stmts.length === 0 && invert)) {
                return options.fn(options.data);
            }
        });
        handlebars.registerHelper("eachprop", function(prop, options) {
          var stmts = currentEntry.getMetadata().find(currentEntry.getResourceURI(), prop);
          var val2choice = defaults.get("itemstore_choices");
          const val2named = defaults.get("blocks_named");
          const localize = defaults.get("localize");
          const es = defaults.get('entrystore');
          const rdfutils = defaults.get('rdfutils');
          var ret = stmts.map(function(stmt) {
                var val = stmt.getValue();
                var choice = val2choice[val];
                var label;
                var desc;
                var regexp = '';
                if (choice && choice.label) {
                    label = localize(choice.label);
                } else if (stmt.getType() === 'uri') {
                  if (val2named[val]) {
                    label = localize(val2named[val]);
                  } else {
                    const entryArr = es.getCache().getByResourceURI(val);
                    if (entryArr.length > 0) {
                      label = rdfutils.getLabel(entryArr[0]);
                    }
                  }
                }
                if (options.hash.regexp) {
                    try {
                      regexp = (val.match(new RegExp(options.hash.regexp)) || ['', ''])[1];
                    } catch(error) {
                    }
                }
                if (choice && choice.description) {
                    desc = localize(choice.description)
                }
                return options.fn({value: val, md5: md5(val), type: stmt.getType(), language: stmt.getLanguage(), lang: stmt.getLanguage(), datatype: stmt.getDatatype(), regexp: regexp, label: label || val, description: desc || ""});
            });
            return ret.join("");
        });
        handlebars.registerHelper("resourceURI", function(options) {
            return currentEntry.getResourceURI();
        });
        handlebars.registerHelper("metadataURI", function(options) {
            return currentEntry.getEntryInfo().getMetadataURI();
        });
        handlebars.registerHelper("entryURI", function(options) {
            return currentEntry.getURI();
        });

        handlebars.registerHelper("prop", function(prop, options) {
            const stmts = currentEntry.getMetadata().find(currentEntry.getResourceURI(), prop);
            if (stmts.length === 0) {
                return "";
            }
            let val = stmts[0].getValue();
            if (options.hash.regexp) {
              try {
                return (val.match(new RegExp(options.hash.regexp)) || ['', ''])[1];
              } catch(error) {
              }
            }

            var val2choice = defaults.get("itemstore_choices");
            var choice = val2choice[val];
            switch (options.hash.render) {
                case "label":
                    if (choice && choice.label) {
                        return defaults.get("localize")(choice.label);
                    }
                    break;
                case "description":
                case "desc":
                    if (choice && choice.label) {
                        return defaults.get("localize")(choice.description);
                    }
                    break;
                case "type":
                    return stmts[0].getType();
                case "language":
                case "lang":
                    return stmts[0].getLanguage();
                case "datatype":
                    return stmts[0].getDatatype();
                case "md5":
                    return md5(val);
            }
            return val;
        });
        handlebars.registerHelper("helperMissing", function(options) {
            throw new Error("No helper for tag: "+options.name)
        });

        initializeHelpers = function() {};
    };

    var parseValues = function(obj, parentObj) {
      const nobj = {};
      Object.keys(obj).forEach(function(key) {
        var value = obj[key];
        if (typeof value === 'string') {
          if (value.indexOf('inherit') === 0) {
            const useKey = value.split(':').length === 1 ? key : value.split(':')[1];
            if (parentObj[useKey]) {
              nobj[key] = parentObj[useKey];
            }
          } else if (value[0] === "{" || value[0] === "[") {
            try {
              nobj[key] = JSON.parse(value);
            } catch(e) {
            }
          } else {
            nobj[key] = obj[key];
          }
        }
      });
      return nobj;
    };

    return {
        unGroup: function(template) {
            idx.push({});
            group = {};
            handlebars.compile(template)({});
            idx.pop();
            return group;
        },
        run: function(node, data, template, entry, body) {
          initializeHelpers();

          const f = function() {
            idx.push({});
            let htemplate;
            try {
              htemplate = handlebars.compile(template ? template : data.htemplate || data.template,
                {data: {strict: true, knownHelpersOnly: true}});
              node.innerHTML = htemplate(data);
            } catch (e) {
              data.error = e.toString();
              data.errorCode = 4;
              data.errorCause = template ? template : data.htemplate;
              error(node, data);
              return;
            }
            const cidx = idx.pop();
            Object.keys(cidx).forEach(function(id) {
              const ob = cidx[id];
              const obj = lang.mixin({templates: ob.templates, entry: data.entry, context: data.context},
                parseValues(ob.options.hash || {}, data), { block: ob.block || ob.component });
              block.run(ob.component, jquery(node).find("#" + ob.id)[0], obj);
            });
          };

          if (body) {
            f();
            return jquery("#" + bodycomponentId)[0];
          } else {
            currentEntry = entry;
            f();
          }
        },
    }
});