require.config({
    baseUrl: "./libs", //Path relative to bootstrapping html file.
    paths: {   //Paths relative baseUrl, only those that deviate from baseUrl/{modulename} are explicitly listed.
        "iis-datahotell": "..",
        "nls": "../merged-nls",
        "theme": "../theme",
        "text": "requirejs-text/text",
        "i18n": "di18n/i18n",
        "fuelux": "fuelux/js",
        "bootstrap": "bootstrap-amd/lib",
        "select2": "select2/src/js",
        "moment": "moment/moment",
        "jquery": "jquery/src",
        "sizzle": "jquery/src/sizzle/dist/sizzle",
        "jquery.mousewheel": "select2/src/js/jquery.mousewheel.shim",
        "requireLib": "requirejs/require",
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
        "entryscape-catalog/public/List",
        "i18n!nls/catalogpublic",
        "select2/select2/i18n/sv" //Explicit load of swedish language for select2 (no require-nls support)
    ]
});

define("config", [], {
    theme: {
        appName: "Internetstiftelsens Datahotell",
        oneRowNavbar: true
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
            "./libs/rdforms/templates/dcterms.json",
            "./libs/rdforms/templates/foaf.json",
            "./libs/rdforms/templates/vcard.json",
            "./libs/rdforms/templates/odrs.json",
            "./templates/dcat-ap.json"
        ]
    },
    site: {
        noLogin: true,
        siteClass: "spa/Site",
        controlClass: "entryscape-commons/nav/Layout",
        startView: "catalogpublic",
        views: [
            {"name": "catalogpublic", "class": "entryscape-catalog/public/List", "title": {en: "Public", sv: "Publikt"}}
        ]
    },
    reCaptchaSiteKey: "6LcSSQITAAAAADJxRzmr5N5etz8mFSFwsaVNr9Ph"
});