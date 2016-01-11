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
                    "./libs/entryscape-catalog/templates/dcat-ap.json"
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
                startView: "start",
                modules: [
                    {
                        name: "catalog",
                        faClass: "archive",
                        hierarchy: {
                            "view": "cataloglist",
                            "subViews": [{
                                view: "catalog",
                                subViews: ["catalogfiles", "datasets", "responsibles", "catalogbrowser"]
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
                    {
                        "name": "start", "class": "entryscape-commons/nav/Start",
                        "title": {en: "Start", sv: "Start"}
                    },
                    {
                        "name": "cataloglist",
                        "class": "entryscape-catalog/catalog/List",
                        "title": {en: "Catalogs", sv: "Kataloger"}
                    },
                    {
                        "name": "catalog",
                        "class": "entryscape-commons/gce/Cards",
                        "constructorParams": {entryId: "dcat"}
                    },
                    {
                        "name": "catalogfiles", "class": "entryscape-catalog/files/List", faClass: "files-o",
                        "title": {en: "Files", sv: "Filer"}
                    },
                    {
                        "name": "datasets",
                        "class": "entryscape-catalog/datasets/List",
                        faClass: "cubes",
                        "title": {en: "Datasets", sv: "Datamängder"},
                        "constructorParams": {createAndRemoveDistributions: true}
                    },
                    {
                        "name": "responsibles",
                        "class": "entryscape-catalog/responsibles/List",
                        faClass: "phone",
                        "title": {en: "Responsibles", sv: "Ansvariga"}
                    },
                    {
                        "name": "catalogbrowser",
                        "class": "entryscape-catalog/graph/Browser",
                        "faClass": "line-chart",
                        "title": {en: "Visualization", sv: "Visualisering"}
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
                        "title": {en: "Terms", sv: "Termer"}
                    },
                    {
                        "name": "termsoptions",
                        "class": "entryscape-commons/gce/Cards",
                        "constructorParams": {entryId: "skos"}
                    },
                    {
                        "name": "concepts", "class": "entryscape-terms/concept/Concepts",
                        "faClass": "tree",
                        "title": {en: "Hierarchy", sv: "Hierarki"}
                    }
                ]
            }
        });
});