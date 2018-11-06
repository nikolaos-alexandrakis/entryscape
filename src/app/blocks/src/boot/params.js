define([
    "config",
    "dojo/hash",
    "dojo/topic",
    "dojo/io-query",
    "entryscape-commons/defaults"
], function(config, hash, topic, ioQuery, defaults) {
    defaults.set("urlParams", config.urlParams);
    var prefix = config.hashParamsPrefix || "esc_";
    var _getFragment = function(params, alwaysFragment) {
        const p = {};
        Object.keys(params).forEach((key) => {
            p[prefix+key] = params[key];
        })
        var query = ioQuery.objectToQuery(p);
        return query.length !== 0 ? "#"+query : (alwaysFragment ? "#noscroll" : "");
/*        var args = [];
        for (var key in params) if (params.hasOwnProperty(key)) {
            args.push(prefix+key+"="+params[key]);
        }
        return args.length > 0 ?"#"+args.join("&") : (alwaysFragment ? "#" : "");*/
    };

    var ext = {
        getLink: function(base, params) {
            return base + _getFragment(params);
        },
        setLocation: function(base, params) {
            window.location.href = base + _getFragment(params, base === "");
        },
        getUrlParams: function() {
            return defaults.get("urlParams");
        },
        /**
         *  Listener will be called with initial value as well as after subsequent changes.
         */
        addListener: function(listener) {
            defaults.onChange("urlParams", listener, true);
        },
        onInit: function(listener) {
            defaults.onInit("urlParams", listener);
        }
    };
    topic.subscribe("/dojo/hashchange", function(hashstr) {
        var prefix = config.hashParamsPrefix || "esc_";
        var hasho = {}, hash = ioQuery.queryToObject(hashstr);
        for (var key in hash) if (hash.hasOwnProperty(key)) {
            if (key.indexOf(prefix) === 0) {
                hasho[key.substr(prefix.length)] = hash[key];
            }
        }
        defaults.set("urlParams", hasho);
    });

    return ext;
});