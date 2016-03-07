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
        "sizzle": "sizzle/dist/sizzle",
        "jquery.mousewheel": "select2/src/js/jquery.mousewheel.shim",
        "typeahead": "typeahead.js/dist/typeahead.jquery",
        "jstree": "jstree/src/jstree",
        "jstree.dnd": "jstree/src/jstree.dnd",
        "jstree.wholerow": "jstree/src/jstree.wholerow",
        "requireLib": "requirejs/require",
        "vis": "vis/dist/vis"
    },
    packages: [ //Config defined using packages to allow for main.js when requiring just config.
        {
            name: "config",
            location: "../config",
            main: "main"
        }
    ],
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
            "jquery/selector": "jquery/selector-sizzle", //Always use the jquery sizzle selector engine.
            "external/sizzle/dist/sizzle": "sizzle"
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
        "entryscape-commons/gce/Cards",
        "entryscape-catalog/catalog/List",
        "entryscape-catalog/files/List",
        "entryscape-catalog/datasets/List",
        "entryscape-catalog/responsibles/List",
        "entryscape-terms/scheme/List",
        "entryscape-terms/concept/Concepts",
        "entryscape-admin/contexts/List",
        "entryscape-admin/groups/List",
        "entryscape-admin/users/List",
        "i18n!nls/modules",
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