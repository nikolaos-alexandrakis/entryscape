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
                "checklist": [{
                    name: "noPrivacyIssues",
                    label: {
                        sv: "Inga sekretessbelagda eller personuppgifter ingår i datamängden",
                        en: "The dataset does not contain confidential or personal information"
                    },
                    description: {
                        sv: "Om genomgång av datamängd visat på hinder iform av sekretessbelagd information eller personuppgifter så redovisas detta som kommentarer på datamängden. Eventuella alternativ för publicering av delar av datamängden ska också redovisas.",
                        en: "If the review of the dataset revealed obstacles such as confidential or personal information this is documented as comments on the dataset. Possible alternatives such as partial publication of the dataset should also be presented as comments."
                    },
                    mandatory: true
                }, {
                    name: "clearLicense",
                    label: {
                        sv: "Upphovsrätten är klargjord",
                        en: "Copyright is cleared"
                    },
                    description: {
                        sv: "Det upphovsrättskydd som gäller för datamängden har klargjorts. Om erkännande krävs i samband med vidarutnyttjande är det också viktigt att det tydliggörs, redovisa i så fall ägare av upphovsrätten och annan relevant information i en kommentar på datamängden.",
                        en: "The copyright and ownership rights of the dataset have been cleared. If recognition is required in connection with re-use, it is important that the name of the copyright holder and other relevant information are provided as comments."
                    },
                    mandatory: true
                }, {
                    name: "clearOwnership",
                    label: {
                        sv: "Dataägare i organisationen är identifierad",
                        en: "Data owner within the organization is identified"
                    },
                    description: {
                        sv: "Ansvar för datamängden i organisationen är känd. Kontaktpunkt, i form av en person eller funktionsadress lämnas som kommentar på datamängden.",
                        en: "The responsible for the dataset is known within the organization. The contact point, in the form of an email address, should be provided as comment on the dataset."
                    },
                    mandatory: true
                }, {
                    name: "digitallyAccessible",
                    label: {
                        sv: "Datamängden är tillgänglig digitalt",
                        en: "The dataset can be digitally accessed"
                    },
                    description: {
                        sv: "Datamängden finns tillgänglig i kända format. Hur man kommer åt datamängden i respektive format är också klargjort.",
                        en: "The dataset is available in known formats. It is clear how the dataset's respective formats can be accessed."
                    }
                }, {
                    name: "addedValue",
                    label: {
                        sv: "Publicering av datamängden innebär ett tydligt mervärde",
                        en: "The publication of the dataset implies a clear added value"
                    },
                    description: {
                        sv: "Datamängden medför ökad transparens, innovation eller effektivisering. Effektivisering omfattar förbättringar inom såväl den egna organisationen som externt.",
                        en: "The dataset contributes to increased transparency, innovation or efficiency. Efficiency includes improvements both within the own organization as well as externally."
                    }
                }, {
                    name: "demand",
                    label: {
                        sv: "Datamängden är efterfrågad",
                        en: "The dataset is sought after"
                    },
                    description: {
                        sv: "Datamängden är efterfrågad antingen inom den egna organisationen eller externt. Detta innebär att minst en målgrupp till datamängden är identifierad.",
                        en: "The dataset is sought after within the own organization or externally. This means that at least one target group for the dataset has been identified."
                    }
                }, {
                    name: "formatDemand",
                    label: {
                        sv: "Efterfrågade format eller protokoll stöds",
                        en: "Requested formats or protocols are supported"
                    },
                    description: {
                        sv: "Datamängden är tillgänglig i de format och protokoll som efterfrågas. Om nya format efterfrågats görs en kommentar om vilka på datamängden, t.ex. om API önskas för målgruppen.",
                        en: "The dataset is available in the formats and protocols that have been requested. It should be noted as a comment if additional formats or protocols are requested, e.g., if an API is requested by a target group."
                    }
                }, {
                    name: "addedCost",
                    label: {
                        sv: "Resurser, kostnader och effektiviseringar är kända",
                        en: "Resources, costs and increased efficiency are known"
                    },
                    description: {
                        sv: "Resurser för publicering och eventuella engångskostnader är kända och sammanvägda med eventuell intern effektivisering. Nya kostnader för framtagning eller underhåll av datamängd lämnas som kommentar.",
                        en: "Resources for publication and any one-time costs are known and weighted with possible improvements of internal efficiency. Additional costs for obtaining or maintaining the dataset are provided as comment."
                    }
                }, {
                    name: "maintenancePlan",
                    label: {
                        sv: "Plan för underhåll av datamängden finns",
                        en: "A plan for maintenance of the dataset is available"
                    },
                    description: {
                        sv: "Plan och metod för underhåll av datamängden i den frekvens som krävs är undersökt och klargjort.",
                        en: "Plan and method for maintenance of the dataset in the required frequency have been investigated and clarified."
                    }
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
                                subViews: ["datasets", "publishers", "contacts", "candidatedatasets", "results"]
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
