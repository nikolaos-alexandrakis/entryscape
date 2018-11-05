define(["rdfjson/namespaces"], function(namespaces) {
    return function(obj, constraints) {
        if (constraints) {
            Object.keys(constraints).forEach(function(key) {
                var val = constraints[key];
                if (namespaces.expand(key) === namespaces.expand("rdf:type")) {
                    obj.rdfType(val);
                } else if (typeof val === "string") {
                    if (val[0] === "<") {
                        obj.uriProperty(key, val.slice(1, val.length - 1));
                    } else {
                        obj.literalProperty(key, val);
                    }
                }
            });
        }
        return obj;
    }
});