import config from 'config';
import PubSub from 'pubsub-js';
import registry from 'commons/registry';
import { queryToObject, objectToQuery } from 'commons/browserUtil';

    registry.set("urlParams", config.urlParams);
    var prefix = config.hashParamsPrefix || "esc_";
    var _getFragment = function(params, alwaysFragment) {
        const p = {};
        Object.keys(params).forEach((key) => {
            p[prefix+key] = params[key];
        })
        var query = objectToQuery(p);
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
            return registry.get("urlParams");
        },
        /**
         *  Listener will be called with initial value as well as after subsequent changes.
         */
        addListener: function(listener) {
            registry.onChange("urlParams", listener, true);
        },
        onInit: function(listener) {
            registry.onInit("urlParams", listener);
        }
    };
    PubSub.subscribe("/dojo/hashchange", function(hashstr) {
        const prefix = config.hashParamsPrefix || 'esc_';
        const hasho = {};
        const hash = queryToObject(hashstr);
        for (var key in hash) if (hash.hasOwnProperty(key)) {
            if (key.indexOf(prefix) === 0) {
                hasho[key.substr(prefix.length)] = hash[key];
            }
        }
        registry.set("urlParams", hasho);
    });

    export default ext;
