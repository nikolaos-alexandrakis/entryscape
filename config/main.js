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
                ],
                choosers: [
                    "entryscape-commons/rdforms/EntryChooser",
                    "entryscape-commons/rdforms/SkosChooser",
                    "entryscape-commons/rdforms/GeonamesChooser",
                    "entryscape-commons/rdforms/GeoChooser"
                ]
            },
            catalog: {
                catalogTemplateId: "dcat:OnlyCatalog",
                datasetTemplateId: "dcat:OnlyDataset",
                distributionTemplateId: "dcat:OnlyDistribution",
                contactTemplateId: "dcat:contactPoint",
                agentTemplateId: "dcat:foaf:Agent",
                // By default collaboration around catalogs are enabled
                //catalogCollaboration: true
                checklist: [{
                    name: "value",
                    label: {en: "Added value", sv: "Mervärde"},
                    mandatory: true
                }, {
                    name: "requested",
                    label: {en: "Requested"},
                    description: {en: "Someone asked for this dataset or indirectly by asking for features that can be accomplished via this dataset."},
                    mandatory: true
                }, {
                    name: "privacy",
                    label: {en: "No privacy issues"}
                    //mandatory: true
                }, {
                    name: "owner",
                    label: {en: "Clear ownership"}
                    //mandatory: true
                }, {
                    name: "license",
                    label: {en: "License clear"}
                    //mandatory: true
                    /*,
                     template: "dcat:license"*/
                }, {
                    name: "accessibility",
                    label: {en: "Data accessible"}
                    //mandatory: true
                }, {
                    name: "formats",
                    label: {en: "Established format(s)"}
                    //mandatory: true
                }, {
                    name: "publication",
                    label: {en: "Known publication cost"}
                }, {
                    name: "maintenance",
                    label: {en: "Maintenance plan"}
                }]
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
                                subViews: ["datasets", "publishers", "contacts", "candidatedatasets"]
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
                                subViews: ["termsoverview", "concepts", "collections"]
                            }]
                        }
                    },
                    {
                        name: "workbench",
                        faClass: "table",
                        hierarchy: {
                            "view": "workbenchstart",
                            "subViews": ["bench"]
                        }
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
                        "name": "publishers",
                        "class": "entryscape-catalog/responsibles/List",
                        "faClass": "users",
                        "title": {en: "Publishers", sv: "Tillhanda&shy;hållande organisa&shy;tioner"},
                        "constructorParams": {publishers: true, contacts: false}
                    },
                    {
                        "name": "contacts",
                        "class": "entryscape-catalog/responsibles/List",
                        "faClass": "phone",
                        "title": {en: "Contacts", sv: "Kontakter"},
                        "constructorParams": {publishers: false, contacts: true}
                    },
                    {
                        "name": "candidatedatasets",
                        "title": {en: "Candidate datasets", sv: "Kandidat&shy;data&shy;mängder"},
                        "class": "entryscape-catalog/candidates/CandidateList",
                        faClass: "tasks"
                    },
                    {
                        "name": "results",
                        "title": {en: "Results", sv: "Resultat"},
                        "class": "entryscape-catalog/results/ResultsList",
                        faClass: "trophy"
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
                        "title": {en: "Terminologies", sv: "Terminologier"},
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
                        "title": {en: "Terms", sv: "Termer"}
                    },
                    {
                        "name": "collections", "class": "entryscape-terms/collection/List",
                        "faClass": "bookmark",
                        "title": {en: "Collections", sv: "Collections"}
                    },
                    {
                        "name": "signin",
                        "title": {en: "Sign in/out", sv: "Logga in/ut"},
                        "class": "entryscape-commons/nav/Signin",
                        "constructorParams": {nextView: "start"}
                    },
                    {
                        "name": "workbenchstart", "class": "entryscape-workbench/space/List",
                        "title": {en: "Workspaces", sv: "Arbetsytor"}
                    },
                    {
                        "name": "bench", "class": "entryscape-workbench/bench/Bench",
                        "faClass": "question"
                    }
                ]
            },
            entitytypes: [
                {
                    name: "publisher",
                    label: {en: "Publisher"},
                    rdfType: ["http://xmlns.com/foaf/0.1/Agent", "http://xmlns.com/foaf/0.1/Person", "http://xmlns.com/foaf/0.1/Organization"],
                    template: "dcat:foaf:Agent",
                    includeInternal: true,
                    includeFile: false,
                    includeLink: false,
                    inlineCreation: true,
                    module: "catalog"
                },
                {
                    name: "contactPoint",
                    label: {en: "Contact point"},
                    rdfType: ["http://www.w3.org/2006/vcard/ns#Individual", "http://www.w3.org/2006/vcard/ns#Organization", "http://www.w3.org/2006/vcard/ns#Kind"],
                    template: "dcat:contactPoint",
                    includeInternal: true,
                    includeFile: false,
                    includeLink: false,
                    inlineCreation: true,
                    module: "catalog"
                },
                {
                    name: "dataset",
                    label: {en: "Dataset"},
                    rdfType: ["http://www.w3.org/ns/dcat#Dataset"],
                    template: "dcat:OnlyDataset",
                    includeInternal: true,
                    includeFile: false,
                    includeLink: false,
                    inlineCreation: false,
                    module: "catalog"
                },
                {
                    name: "catalog",
                    label: {en: "catalog"},
                    rdfType: ["http://www.w3.org/ns/dcat#Catalog"],
                    template: "dcat:OnlyCatalog",
                    includeInternal: true,
                    includeFile: false,
                    includeLink: false,
                    inlineCreation: false,
                    module: "catalog"
                }
            ],
            contexttypes: [
                {
                    name: "catalogContext",
                    rdfType: "http://entryscape.com/terms/CatalogContext",
                    entryType:"dcat:Catalog"
                },
                {
                    name: "terminologyContext",
                    rdfType: "http://entryscape.com/terms/TerminologyContext",
                    entryType: "skos:ConceptScheme"
                },
                {
                    name: "workbenchContext",
                    rdfType: "http://entryscape.com/terms/WorkbenchContext"
                },
                {
                    name: "context",
                    rdfType: "http://entryscape.com/terms/Context"
                }
            ]
        }, local);
});
