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
                        "title": {en: "Sign in/out", sv: "Logga in/ut"},
                        "class": "entryscape-commons/nav/Signin",
                        "constructorParams": {nextView: "start"}
                    },
                    {
                        "name": "start", "class": "entryscape-commons/nav/Start",
                        "title": {en: "Start", sv: "Start"}
                    },
                    {
                        "name": "datasetsearch",
                        "class": "entryscape-catalog-portal/search/List",
                        "title": {en: "Search", sv: "Sök"}
                    },
                    {
                        "name": "catalogsearch",
                        "class": "entryscape-catalog-portal/search/Catalog",
                        "title": {en: "Search datasets", sv: "Sök datamängder"}
                    },
                    {
                        "name": "public",
                        "class": "entryscape-catalog-portal/public/Public",
                        "title": {en: "Dataset", sv: "Datamängd"}
                    }
                ],
                modules: [{
                    name: "catalogsearch",
                    title: {en: "Search", sv: "Sök"},
                    faClass: "search",
                    hierarchy: {
                        "view": "catalogsearch",
                        "subViews": [{
                            view: "public"
                        }]
                    }
                }],
                moduleList: ["catalog", "terms", "workbench", "catalogsearch", "admin"]
            },
            catalog: {
                previewURL: "#view=public&resource=${url}"
            }
        }, __entryscape_config);
});
