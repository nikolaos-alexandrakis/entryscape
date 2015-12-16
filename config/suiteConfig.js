require.config({
    baseUrl: "./libs", //Path relative to bootstrapping html file.
    paths: {   //Paths relative baseUrl, only those that deviate from baseUrl/{modulename} are explicitly listed.
        "entryscape-suite": "..",
        "nls": "../merged-nls",
        "theme": "entryscape-commons/theme",
        "text": "requirejs-text/text",
        "i18n": "di18n/i18n",
        "fuelux": "fuelux/js",
        "bootstrap": "bootstrap-amd/lib",
        "select2": "select2/src/js",
        "moment": "moment/moment",
        "jquery": "jquery/src",
        "sizzle": "jquery/src/sizzle/dist/sizzle",
        "jquery.mousewheel": "select2/src/js/jquery.mousewheel.shim",
        "typeahead": "typeahead.js/dist/typeahead.jquery",
        "jstree": "jstree/src/jstree",
        "jstree.dnd": "jstree/src/jstree.dnd",
        "jstree.wholerow": "jstree/src/jstree.wholerow",
        "requireLib": "requirejs/require",
        "vis": "vis/dist/vis",
        "config": "empty:" //Because we define it inline below.
    },
    map: {
        "*": {
            "jquery": "jquery/jquery",  //In general, use the main module (for all unqualified jquery dependencies).
            "jquery/selector": "jquery/selector-sizzle", //Always use the jquery sizzle selector engine.
            "has": "dojo/has", //Use dojos has module since it is more clever.
            "dojo/text": "text", //Use require.js text module
            //Make sure i18n, dojo/i18n and di18n/i18n are all treated as a SINGLE module named i18n.
            //(We have mapped i18n to be the module provided in di18n/i18n, see paths above.)
            "dojo/i18n": "i18n",
            "di18n/i18n": "i18n"
        },
        "jquery": {
            "jquery": "jquery", //Reset (override general mapping) to normal path (jquerys has dependencies to specific modules).
            "jquery/selector": "jquery/selector-sizzle" //Always use the jquery sizzle selector engine.
        },
        "bootstrap": {
            "jquery": "jquery", //Reset (override general mapping) to normal path (bootstraps has dependencies to specific dependencies).
            "jquery/selector": "jquery/selector-sizzle" //Always use the jquery sizzle selector engine.
        },
        "store/rest": {
            "dojo/request": "dojo/request/xhr", //Force using xhr since we know we are in the browser
            "dojo/request/iframe": "dojo/request/iframe" //Override above line for iframe path.
        },
        "rdforms/template/bundleLoader": {
            "dojo/request": "dojo/request/xhr"  //Force using xhr since we know we are in the browser
        }
    },
    deps: [
        "entryscape-commons/commonDeps",
        "entryscape-commons/nav/Cards",
        "entryscape-catalog/catalog/List",
        "entryscape-catalog/catalog/Catalog",
        "entryscape-catalog/files/List",
        "entryscape-catalog/datasets/List",
        "entryscape-catalog/responsibles/List",
        "entryscape-terms/scheme/List",
        "entryscape-terms/concept/Concepts",
        "entryscape-admin/contexts/List",
        "entryscape-admin/groups/List",
        "entryscape-admin/users/List",
        "i18n!nls/catalog",
        "i18n!nls/catalogfiles",
        "i18n!nls/catalogpublic",
        "i18n!nls/dataset",
        "i18n!nls/responsible",
        "i18n!nls/admincontext",
        "i18n!nls/admingroup",
        "i18n!nls/adminuser",
        "i18n!nls/layout",
        "i18n!nls/list",
        "i18n!nls/modules",
        "i18n!nls/rdforms",
        "i18n!nls/scheme",
        "i18n!nls/signin",
        "i18n!nls/concept",
        "select2/select2/i18n/sv" //Explicit load of swedish language for select2 (no require-nls support)
    ]
});

define("config", [], {
    theme: {
        appName: "EntryScape",
        oneRowNavbar: false
    },
    locale: {
        fallback: "en",
        supported: [
            {lang: "en", flag: "gb", label: "English", labelEn: "English"},
            {lang: "sv", flag: "se", label: "Svenska", labelEn: "Swedish"}
        ]
    },
    entrystore: {
        repository: "http://localhost:8080/store/" //CHANGE THIS LINE (to reflect the correct URL to your EntryStore installation)
    },
    itemstore: {
        bundles: [
            "./libs/entryscape-terms/templates/terms.json",
            "./libs/rdforms/templates/skos.json",
            "./libs/rdforms/templates/dcterms.json",
            "./libs/rdforms/templates/foaf.json",
            "./libs/rdforms/templates/vcard.json",
            "./libs/rdforms/templates/odrs.json",
            "./libs/entryscape-catalog/templates/dcat-ap.json"
        ]
    },
    site: {
        siteClass: "spa/Site",
        controlClass: "entryscape-commons/nav/Layout",
        startView: "start",
        modules: [
            {
                name: "catalog",
                faClass: "archive",
                hierarchy: {
                    "view": "cataloglist",
                    "subViews": [{
                        view: "catalog",
                        subViews: ["catalogfiles", "datasets", "responsibles", "catalogbrowser"]}]
                }
            },
            {
                name: "import",
                faClass: "download",
                views: []
            },
            {
                name: "terms",
                faClass: "sitemap",
                hierarchy: {
                    "view": "termsstart",
                    "subViews": [{
                        view: "termsoptions",
                        subViews: ["concepts"]
                    }]
                }
            },
            {
                name: "workbench",
                faClass: "table",
                views: []
            },
            {
                name: "admin",
                faClass: "cogs", //faClass: "wrench",
                hierarchy: {
                    "view": "adminstart",
                    "subViews": ["adminusers", "admingroups", "admincontexts"]
                }
            },
            {
                name: "search",
                faClass: "search",
                views: []
            }
        ],
        views: [
            {"name": "start", "class": "entryscape-commons/nav/Start",
                "title": {en: "Start", sv: "Start"}
            },
            {"name": "cataloglist", "class": "entryscape-catalog/catalog/List", "title": {en: "Catalogs", sv: "Kataloger"}
            },
            {"name": "catalog", "class": "entryscape-catalog/catalog/Catalog"},
            {"name": "catalogfiles", "class": "entryscape-catalog/files/List", faClass: "files-o",
                "title": {en: "Files", sv: "Filer"}},
            {"name": "datasets",
                "class": "entryscape-catalog/datasets/List",
                faClass: "cubes",
                "title": {en: "Datasets", sv: "Datamängder"},
                "constructorParams": {createAndRemoveDistributions: true}
            },
            {"name": "responsibles",
                "class": "entryscape-catalog/responsibles/List",
                faClass: "phone",
                "title": {en: "Responsibles", sv: "Ansvariga"}
            },
            {"name": "catalogbrowser",
                "class": "entryscape-catalog/graph/Browser",
                "faClass": "line-chart",
                "title": {en: "Visualization", sv: "Visualisering"}
            },
            {"name": "adminstart", "class": "entryscape-commons/nav/Cards",
                "title": {en: "Administration", sv: "Administration"}
            },
            {"name": "adminusers", "class": "entryscape-admin/users/List",
                "faClass": "user",
                "title": {en: "Users", sv: "Användare"}
            },
            {"name": "admingroups", "class": "entryscape-admin/groups/List",
                "faClass": "users",
                "title": {en: "Groups", sv: "Grupper"}
            },
            {"name": "admincontexts", "class": "entryscape-admin/contexts/List",
                "faClass": "building",
                "title": {en: "Workspaces", sv: "Arbetsytor"}
            },
            {"name": "termsstart", "class": "entryscape-terms/scheme/List",
                "title": {en: "Terms", sv: "Termer"}
            },
            {"name": "termsoptions",
                "class": "entryscape-commons/gce/Cards",
                "constructorParams": {entryId: "skos"}
            },
            {"name": "concepts", "class": "entryscape-terms/concept/Concepts",
                "faClass": "tree",
                "title": {en: "Hierarchy", sv: "Hierarki"}
            }
        ]
    },
    reCaptchaSiteKey: "6LcSSQITAAAAADJxRzmr5N5etz8mFSFwsaVNr9Ph"
});
