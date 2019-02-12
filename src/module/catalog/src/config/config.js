/* eslint-disable max-len */
export default {
  catalog: {
    catalogTemplateId: 'dcat:OnlyCatalog',
    datasetTemplateId: 'dcat:OnlyDataset',
    distributionTemplateId: 'dcat:OnlyDistribution',
    contactPointTemplateId: 'dcat:contactPoint',
    distributionTemplateCreate: false,
    agentTemplateId: 'dcat:foaf:Agent',
    datasetResultTemplateId: 'esc:Results',
    datasetIdeaTemplateId: 'esc:Ideas',
    datasetCandidateTemplateId: 'esc:DatasetCandidate',
    excludeEmptyCatalogsInSearch: true,
    formatTemplateId: 'dcat:format-group_di',
    formatProperty: 'dcterms:format',
    catalogCreationAllowedFor: '_users',
    unpublishDatasetAllowedFor: '_users',
    // eslint-disable-next-line no-template-curly-in-string
    previewURL: '#view=dataset&resource=${url}',
    includeEmbeddOption: true,
    includeShowcasesInDatasetMenu: true,
    includeIdeasInDatasetMenu: true,
    includeCandidates: true,
    checklist: [{
      name: 'noPrivacyIssues',
      shortLabel: {
        en: 'Privacy',
        sv: 'Sekretess',
        da: 'Fortrolig',
        de: 'Datenschutz',
      },
      label: {
        sv: 'Inga sekretessbelagda eller personuppgifter ingår i datamängden',
        da: 'Datasættet indeholder ikke fortrolige eller personlige information',
        en: 'The dataset does not contain confidential or personal information',
        de: 'Der Datensatz beinhaltet keine vertraulichen oder persönlichen Informationen',
      },
      description: {
        sv: 'Om genomgång av datamängd visat på hinder iform av sekretessbelagd information eller personuppgifter så redovisas detta som kommentarer på datamängden. Eventuella alternativ för publicering av delar av datamängden ska också redovisas.',
        da: 'Hvis gennemgangen af datasættet frembringer forhindringer såsom fortrolighed eller personlige informationinformation skal dette dokumenteres som kommentarer på datasættet. Et eventuelt alternativ er publicering af dele af datasættet skal også beskrives i kommentarerne.',
        en: 'If the review of the dataset revealed obstacles such as confidential or personal information this is documented as comments on the dataset. Possible alternatives such as partial publication of the dataset should also be presented as comments.',
        de: 'Falls beim Durchsehen des Datensatzes Hürden wie vertrauliche oder persönliche Informationen offenlegt werden, werden diese als Kommentar am Datensatz dokumentiert. Mögliche Alternativen wie eine teilweise Veröffentlichung des Datensatzes können ebenfalls als Kommentare dargestellt werden.',
      },
      mandatory: true,
    }, {
      name: 'clearLicense',
      shortLabel: {
        en: 'License',
        sv: 'Upphovsrätt',
        da: 'Uphavsrett',
        de: 'Lizenz',
      },
      label: {
        sv: 'Upphovsrätten är klargjord',
        da: 'Ophavsretten er sikret',
        en: 'Copyright is cleared',
        de: 'Urheberrecht ist geklärt',
      },
      description: {
        sv: 'Det upphovsrättskydd som gäller för datamängden har klargjorts. Om erkännande krävs i samband med vidarutnyttjande är det också viktigt att det tydliggörs, redovisa i så fall ägare av upphovsrätten och annan relevant information i en kommentar på datamängden.',
        da: 'Den ophavsret og ejerrettigheder på datasættet som er sikret. Hvis anerkendelse af ophavsret eller rettighedsejer er nødvendig i forbindelse med genbrug eller videreanvendelse, er det vigtigt at navnet på rettighedsindehaveratt samt andre relevante informationer er beskrevet i kommentarerne.',
        en: 'The copyright and ownership rights of the dataset have been cleared. If recognition is required in connection with re-use, it is important that the name of the copyright holder and other relevant information are provided as comments.',
        de: 'Das Urheberrecht und die Eigentümerrechte des Datensatzes wurden geklärt. Falls Wiedererkennung benötigt wird in Verbindung mit der Wiederverwendung, ist es wichtig, dass der Name des Urheberrechtsinhabers und andere relevante Informationen als Kommentare bereitgestellt werden.',
      },
      mandatory: true,
    }, {
      name: 'clearOwnership',
      shortLabel: {
        en: 'Ownership',
        sv: 'Ägarskap',
        da: 'Ejendom',
        de: 'Eigentum',
      },
      label: {
        sv: 'Dataägare i organisationen är identifierad',
        da: 'Dataejere indenfor organisationen er identificeret',
        en: 'Data owner within the organization is identified',
        de: 'Eigentümer der Daten innerhalb der Organisation ist identifiziert',
      },
      description: {
        sv: 'Ansvar för datamängden i organisationen är känd. Kontaktpunkt, i form av en person eller funktionsadress lämnas som kommentar på datamängden.',
        da: 'Ansvar for datasættet i organisationen er kendt. Kontaktpunkt, i form af en person eller funktionspostkasse beskrives i kommentarerne på datasættet.',
        en: 'The responsible for the dataset is known within the organization. The contact point, in the form of an email address, should be provided as comment on the dataset.',
        de: 'Die Verantwortlichen für den Datensatz sind innerhalb der Organisation bekannt. Der Kontakt in Form einer E-Mail-Adresse sollte als Kommentar im Datensatz bereitgestellt werden.',
      },
      mandatory: true,
    }, {
      name: 'digitallyAccessible',
      shortLabel: {
        en: 'Digital',
        sv: 'Digitalt',
        da: 'Digitald',
        de: 'Digital',
      },
      label: {
        sv: 'Datamängden är tillgänglig digitalt',
        da: 'Datasættet er tilgængeligt digitalt',
        en: 'The dataset can be digitally accessed',
        de: 'Auf den Datensatz kann digital zugegriffen werden',
      },
      description: {
        sv: 'Datamängden finns tillgänglig i kända format. Hur man kommer åt datamängden i respektive format är också klargjort.',
        da: 'Datasættet findes tilgængeligt i kendte formatter. Det er gjort tydeligt hvordan man får adgang til datasættets respektive formatter.',
        en: "The dataset is available in known formats. It is clear how the dataset's respective formats can be accessed.",
        de: 'Der Datensatz ist in verschiedenen Formaten verfügbar. Es ist klar wie auf die entsprechenden Formate zugegriffen werden kann.',
      },
    }, {
      name: 'addedValue',
      shortLabel: {
        en: 'Added value',
        sv: 'Mervärde',
        da: 'Merværdi',
        de: 'Mehrwert',
      },
      label: {
        sv: 'Publicering av datamängden innebär ett tydligt mervärde',
        da: 'Publicering af datasættet har en tydelig merværdi',
        en: 'The publication of the dataset implies a clear added value',
        de: 'Die Veröffentlichung des Datensatzes stellt einen Mehrwert dar',
      },
      description: {
        sv: 'Datamängden medför ökad transparens, innovation eller effektivisering. Effektivisering omfattar förbättringar inom såväl den egna organisationen som externt.',
        da: 'Datasættet medfører øget transparens, innovation eller effektivisering. Effektivisering omfatter forbedringer både indenfor egen organisation såvel som udenfor.',
        en: 'The dataset contributes to increased transparency, innovation or efficiency. Efficiency includes improvements both within the own organization as well as externally.',
        de: 'Der Datensatz trägt zu steigender Transparenz, Innovation oder Effizienz bei. Effizienz beinhaltet Verbesserungen innerhalb der Organisation als auch externer Art.',
      },
    }, {
      name: 'demand',
      shortLabel: {
        en: 'Demand',
        sv: 'Efterfråga',
        da: 'Efterspørgsel',
        de: 'Nachfrage',
      },
      label: {
        sv: 'Datamängden är efterfrågad',
        da: 'Datasættet er efterspurgt',
        en: 'The dataset is sought after',
        de: 'Nach dem Datensatz wird gesucht',
      },
      description: {
        sv: 'Datamängden är efterfrågad antingen inom den egna organisationen eller externt. Detta innebär att minst en målgrupp till datamängden är identifierad.',
        da: 'Datasættet er efterspurgt indenfor egen organisation eller udenfor. Dette indebærer at der er identificeret mindst en målgruppe til datasættet.',
        en: 'The dataset is sought after within the own organization or externally. This means that at least one target group for the dataset has been identified.',
        de: 'Nach dem Datensatz wird innerhalb der Organisation oder von externer Seite aus gesucht. Das bedeutet das mindestens eine Zielgruppe für den Datensatz identifiziert wurde.',
      },
    }, {
      name: 'formatDemand',
      shortLabel: {
        en: 'Formats',
        sv: 'Format',
        da: 'Formatter',
        de: 'Formate',
      },
      label: {
        sv: 'Efterfrågade format eller protokoll stöds',
        da: 'Efterspurgte formatter eller protokoller er understøttet',
        en: 'Requested formats or protocols are supported',
        de: 'Angefragte Formate oder Protokolle werden unterstützt',
      },
      description: {
        sv: 'Datamängden är tillgänglig i de format och protokoll som efterfrågas. Om nya format efterfrågats görs en kommentar om vilka på datamängden, t.ex. om API önskas för målgruppen.',
        da: 'Datasættet er tilgængeligt i de formatter og protokoller som er efterspurgt. Det skal registreres som kommentarer hvis yderligere formatter eller protokoller er efterspurgt, f.eks. hvis et API er efterspurgt af en specifik målgruppe.',
        en: 'The dataset is available in the formats and protocols that have been requested. It should be noted as a comment if additional formats or protocols are requested, e.g., if an API is requested by a target group.',
        de: 'Der Datensatz ist verfügbar in den Formaten und Protokollen die angefragt wurden. Es sollte eine Notiz als Kommentar gemacht werden, falls zusätzliche Formate oder Protokolle angefragt werden, zum Beispiel falls eine API durch eine Zielgruppe angefragt wurde.',
      },
    }, {
      name: 'addedCost',
      shortLabel: {
        en: 'Cost',
        sv: 'Kostnader',
        da: 'Omkostninger',
        de: 'Kosten',
      },
      label: {
        sv: 'Resurser, kostnader och effektiviseringar är kända',
        da: 'Resurser, omkostninger og effektiviseringar er kendte',
        en: 'Resources, costs and increased efficiency are known',
        de: 'Ressourcen, Kosten und eine ansteigende Effizienz sind bekannt',
      },
      description: {
        sv: 'Resurser för publicering och eventuella engångskostnader är kända och sammanvägda med eventuell intern effektivisering. Nya kostnader för framtagning eller underhåll av datamängd lämnas som kommentar.',
        da: 'Nødvendigte resurser or publicering og eventuelle engangsomkostninger er kendte vurderet i forhold til mulige forbedringer af intern effektivitet. Yderligere omkostninger for at bevare eller vedligeholde datasættet er registreret i en kommentar.',
        en: 'Resources for publication and any one-time costs are known and weighted with possible improvements of internal efficiency. Additional costs for obtaining or maintaining the dataset are provided as comment.',
        de: 'Ressourcen zum Veröffentlichen und alle einmaligen Kosten sind bekannt und gewichtet nach möglichen Verbesserungen der internen Effizienz. Zusätzliche Kosten zum Erhalt oder Pflege des Datensatzes werden als Kommentar zur Verfügung gestellt.',
      },
    }, {
      name: 'maintenancePlan',
      shortLabel: {
        en: 'Maintenance',
        sv: 'Underhåll',
        da: 'Vedligehold',
        de: 'Pflege',
      },
      label: {
        sv: 'Plan för underhåll av datamängden finns',
        da: 'Plan for vedligehold af datasættet findes',
        en: 'A plan for maintenance of the dataset is available',
        de: 'Ein Konzept für die Pflege des Datensatzes ist verfügbar',
      },
      description: {
        sv: 'Plan och metod för underhåll av datamängden i den frekvens som krävs är undersökt och klargjort.',
        da: 'Plan og metode for vedligeholdelse af datasættet i den frekvens som er påkrævet er undersøgt og tydeliggjort.',
        en: 'Plan and method for maintenance of the dataset in the required frequency have been investigated and clarified.',
        de: 'Konzept und Methode für die Pflege des Datensatzes in der benötigten Frequenz sind untersucht und geklärt wurden.',
      },
    }],
  },
  itemstore: {
    choosers: [
      'EntryChooser',
      'GeonamesChooser',
      'GeoChooser',
    ],
  },
  entitytypes: {
    publisher: {
      label: { en: 'Publisher' },
      rdfType: ['http://xmlns.com/foaf/0.1/Agent', 'http://xmlns.com/foaf/0.1/Person', 'http://xmlns.com/foaf/0.1/Organization'],
      module: 'catalog',
      template: 'dcat:foaf:Agent',
      includeInternal: true,
      includeFile: false,
      includeLink: false,
      inlineCreation: true,
      faClass: 'users',
    },
    contactPoint: {
      label: { en: 'Contact point' },
      rdfType: ['http://www.w3.org/2006/vcard/ns#Individual', 'http://www.w3.org/2006/vcard/ns#Organization', 'http://www.w3.org/2006/vcard/ns#Kind'],
      module: 'catalog',
      template: 'dcat:contactPoint',
      includeInternal: true,
      includeFile: false,
      includeLink: false,
      inlineCreation: true,
      faClass: 'phone',
    },
    dataset: {
      label: { en: 'Dataset' },
      rdfType: ['http://www.w3.org/ns/dcat#Dataset'],
      module: 'catalog',
      template: 'dcat:OnlyDataset',
      includeInternal: true,
      includeFile: false,
      includeLink: false,
      inlineCreation: false,
      faClass: 'cubes',
    },
    candidate: {
      label: { en: 'Candidate dataset' },
      rdfType: ['http://entryscape.com/terms/CandidateDataset'],
      module: 'catalog',
      template: 'esc:DatasetCandidate',
      includeInternal: true,
      includeFile: false,
      includeLink: false,
      inlineCreation: false,
      faClass: 'tasks',
    },
    distribution: {
      label: { en: 'Distribution' },
      rdfType: ['http://www.w3.org/ns/dcat#Distribution'],
      module: 'catalog',
      template: 'dcat:OnlyDistribution',
      includeInternal: true,
      includeFile: false,
      includeLink: false,
      inlineCreation: false,
    },
    catalog: {
      label: { en: 'catalog' },
      rdfType: ['http://www.w3.org/ns/dcat#Catalog'],
      module: 'catalog',
      template: 'dcat:OnlyCatalog',
      includeInternal: true,
      includeFile: false,
      includeLink: false,
      inlineCreation: false,
    },
    datasetResult: {
      label: { en: 'Results' },
      rdfType: ['http://entryscape.com/terms/Results'],
      module: 'catalog',
      template: 'esc:Results',
      includeInternal: true,
      includeFile: false,
      includeLink: false,
      inlineCreation: false,
      faClass: 'diamond',
    },
    datasetIdea: {
      label: { en: 'Ideas' },
      rdfType: ['http://entryscape.com/terms/Ideas'],
      module: 'catalog',
      template: 'esc:Ideas',
      includeInternal: true,
      includeFile: false,
      includeLink: false,
      inlineCreation: false,
      faClass: 'lightbulb-o',
    },
    datasetDocument: {
      label: { en: 'Document' },
      rdfType: ['foaf:Document', 'dcterms:LicenseDocument', 'dcterms:Standard'],
      module: 'catalog',
      template: 'dcat:Documentish',
      includeInternal: false,
      includeFile: true,
      includeLink: true,
      inlineCreation: true,
      faClass: 'file',
    },
  },
  contexttypes: {
    catalogContext: {
      rdfType: 'http://entryscape.com/terms/CatalogContext',
      entryType: 'dcat:Catalog',
    },
  },
};
