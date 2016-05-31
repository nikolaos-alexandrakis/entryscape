define(["entryscape-commons/merge", "config/local"], function(merge, local) {
        return merge({
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
            itemstore: {
                bundles: [
                    "./libs/entryscape-terms/templates/terms.json",
                    "./libs/rdforms/templates/skos.json",
                    "./libs/rdforms/templates/dcterms.json",
                    "./libs/rdforms/templates/foaf.json",
                    "./libs/rdforms/templates/vcard.json",
                    "./libs/rdforms/templates/odrs.json",
                    "./libs/entryscape-catalog/templates/dcat-ap_props.json",
                    "./libs/entryscape-catalog/templates/dcat-ap.json",
                    "./libs/entryscape-commons/templates/esc.json"
                ]
            },
            catalog: {
                catalogTemplateId: "dcat:OnlyCatalog",
                datasetTemplateId: "dcat:OnlyDataset",
                distributionTemplateId: "dcat:OnlyDistribution",
                contactTemplateId: "dcat:contactPoint",
                agentTemplateId: "dcat:foaf:Agent"
            },
            site: {
                siteClass: "spa/Site",
                controlClass: "entryscape-commons/nav/Layout",
                startView: "signin",
                sidebar: {wide: false, always: true, replaceTabs: true},
                modules: [
                    {
                        name: "catalog",
                        faClass: "archive",
                        hierarchy: {
                            "view": "cataloglist",
                            "subViews": [{
                                view: "catalog",
                                sidebar: true,
                                subViews: ["datasets", "responsibles"]
                            }]
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
                                sidebar: true,
                                subViews: ["termsoverview", "concepts"]
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
                        startView: "adminusers",
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
                    {
                        "name": "start", "class": "entryscape-commons/nav/Start",
                        "title": {en: "Start", sv: "Start"}
                    },
                    {
                        "name": "cataloglist",
                        "class": "entryscape-catalog/catalog/List",
                        "title": {en: "Catalogs", sv: "Kataloger"},
                        "constructorParams": {rowClickView: "datasets"}
                    },
                    {
                        "name": "catalog",
                        labelCrumb: true,
                        "class": "entryscape-commons/gce/Cards",
                        "constructorParams": {entryType: "dcat:Catalog"}
                    },
                    {
                        "name": "catalogfiles", "class": "entryscape-catalog/files/List", faClass: "files-o",
                        "title": {en: "Files", sv: "Filer"}
                    },
                    {
                        "name": "datasets",
                        "class": "entryscape-catalog/datasets/List",
                        faClass: "cubes",
                        "title": {en: "Datasets", sv: "Data&shy;mängder"},
                        "constructorParams": {createAndRemoveDistributions: true}
                    },
                    {
                        "name": "responsibles",
                        "class": "entryscape-catalog/responsibles/List",
                        faClass: "phone",
                        "title": {en: "Contacts", sv: "Kontakter"}
                    },
                    {
                        "name": "adminstart", "class": "entryscape-commons/nav/Cards",
                        "title": {en: "Administration", sv: "Administration"}
                    },
                    {
                        "name": "adminusers", "class": "entryscape-admin/users/List",
                        "faClass": "user",
                        "title": {en: "Users", sv: "Användare"}
                    },
                    {
                        "name": "admingroups", "class": "entryscape-admin/groups/List",
                        "faClass": "users",
                        "title": {en: "Groups", sv: "Grupper"}
                    },
                    {
                        "name": "admincontexts", "class": "entryscape-admin/contexts/List",
                        "faClass": "building",
                        "title": {en: "Workspaces", sv: "Arbetsytor"}
                    },
                    {
                        "name": "termsstart", "class": "entryscape-terms/scheme/List",
                        "title": {en: "Vocabularies", sv: "Vokabulärer"},
                        "constructorParams": {rowClickView: "termsoverview"}
                    },
                    {
                        "name": "termsoptions",
                        "class": "entryscape-commons/gce/Cards",
                        labelCrumb: true,
                        "constructorParams": {entryType: "skos:ConceptScheme"}
                    },
                    {
                        "name": "termsoverview", "class": "entryscape-terms/overview/Overview",
                        "faClass": "eye",
                        "title": {en: "Overview", sv: "Översikt"}
                    },
                    {
                        "name": "concepts", "class": "entryscape-terms/concept/Concepts",
                        "faClass": "list",
                        "wide": true,
                        "title": {en: "Terms", sv: "Termer"}
                    },
                    {
                        "name": "signin",
                        "title": {en: "Sign in/out", sv: "Logga in/ut"},
                        "class": "entryscape-commons/nav/Signin",
                        "constructorParams": {nextView: "start"}
                    }
                ]
            }
        }, local);
});