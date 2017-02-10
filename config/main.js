define([
    "entryscape-commons/merge",
    "entryscape-admin/config/adminConfig",
    "entryscape-catalog/config/catalogConfig",
    "entryscape-terms/config/termsConfig",
    "entryscape-workbench/config/workbenchConfig"
], function(merge, adminConfig, catalogConfig, termsConfig, workbenchConfig) {
        return merge(adminConfig, catalogConfig, termsConfig, workbenchConfig, {
            theme: {
                appName: "EntryScape",
                oneRowNavbar: false,
                localTheme: false
            },
            locale: {
                fallback: "en",
                supported: [
                    {lang: "en", flag: "gb", label: "English", labelEn: "English"},
                    {lang: "sv", flag: "se", label: "Svenska", labelEn: "Swedish"}
                ]
            },
            itemstore: {
                "!bundles": [
                    "templates/skos/skos",
                    "templates/dcterms/dcterms",
                    "templates/foaf/foaf",
                    "templates/vcard/vcard",
                    "templates/odrs/odrs",
                    "templates/dcat-ap/dcat-ap_props",
                    "templates/dcat-ap/dcat-ap",
                    "templates/entryscape/esc"
                ]
            },
            site: {
                siteClass: "spa/Site",
                controlClass: "entryscape-commons/nav/Layout",
                startView: "signin",
                sidebar: {wide: false, always: true, replaceTabs: true},
                views: [
                    {
                        "name": "signin",
                        "title": {en: "Sign in/out", sv: "Logga in/ut",  da: "Login/ud"},
                        "class": "entryscape-commons/nav/Signin",
                        "constructorParams": {nextView: "start"}
                    },
                    {
                        "name": "start", "class": "entryscape-commons/nav/Start",
                        "title": {en: "Start", sv: "Start", da: "Start"}
                    }
                ],
                modules: [{
                    name: "search",
                    title: {en: "Search"},
                    faClass: "search",
                    hierarchy: {
                        "view": "catalogsearch",
                        "subViews": [{
                            view: "dataset"
                        }]
                    }
                }, {
                    name: "catalogsearch", //Remove this module in next release (same as search with old name).
                    title: {en: "Search"},
                    faClass: "search",
                    hierarchy: {
                        "view": "catalogsearch",
                        "subViews": [{
                            view: "dataset"
                        }]
                    }
                }
                ],
                moduleList: ["catalog", "terms", "workbench", "search", "admin"]
            }
        }, __entryscape_config);
});
