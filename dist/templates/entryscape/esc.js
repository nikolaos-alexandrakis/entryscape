define({
  "templates": [
    {
      "type": "group",
      "nodetype": "RESOURCE",
      "id": "esc:Group",
      "label": {
        "en": "Group",
        "sv": "Grupp",
        "de": "Gruppe"
      },
      "items": [
        {
          "type": "text",
          "nodetype": "LITERAL",
          "extends": "foaf:name",
          "cardinality": {
            "min": 1,
            "pref": 0
          }
        },
        {
          "type": "text",
          "nodetype": "URI",
          "extends": "foaf:homepage",
          "cardinality": {
            "min": 0,
            "pref": 0
          }
        }
      ]
    },
    {
      "type": "group",
      "nodetype": "RESOURCE",
      "id": "esc:User",
      "label": {
        "en": "User",
        "sv": "Användare",
        "de": "Benutzer"
      },
      "items": [
        {
          "type": "text",
          "nodetype": "LITERAL",
          "extends": "foaf:givenName",
          "cardinality": {
            "min": 1,
            "pref": 0
          }
        },
        {
          "type": "text",
          "nodetype": "LITERAL",
          "extends": "foaf:familyName",
          "cardinality": {
            "min": 1,
            "pref": 0
          }
        },
        {
          "type": "text",
          "nodetype": "LITERAL",
          "extends": "foaf:mbox"
        }
      ]
    },
    {
      "type": "group",
      "nodetype": "RESOURCE",
      "id": "esc:Context",
      "label": {
        "en": "Project",
        "sv": "Projekt",
        "de": "Projekt"
      },
      "items": [
        {
          "type": "text",
          "nodetype": "LANGUAGE_LITERAL",
          "extends": "dcterms:title",
          "cardinality": {
            "min": 1,
            "pref": 0
          }
        },
        {
          "type": "text",
          "nodetype": "LANGUAGE_LITERAL",
          "extends": "dcterms:description",
          "cardinality": {
            "min": 0,
            "pref": 1
          }
        },
        {
          "type": "text",
          "extends": "dcterms:identifier",
          "cardinality": {
            "min": 0,
            "pref": 0
          }
        }
      ]
    },
    {
      "type": "group",
      "nodetype": "RESOURCE",
      "id": "esc:DatasetCandidate",
      "items": [
        {
          "extends": "dcterms:title",
          "cardinality": {
            "min": 1
          }
        },
        {
          "extends": "dcterms:description",
          "cardinality": {
            "min": 0,
            "pref": 1
          }
        }
      ]
    },
    {
      "type": "group",
      "id": "esc:Results",
      "label": {
        "en": "Results",
        "sv": "Resultat",
        "de": "Ergebnisse"
      },
      "constraints": {
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://entryscape.com/terms/#Result"
      },
      "items": [
        {
          "id": "results:dcterms:title"
        },
        {
          "id": "results:dcterms:description"
        },
        {
          "id": "results:dataset:source"
        },
        {
          "id": "results:foaf:page"
        },
        {
          "id": "results:dcterms:created"
        },
        {
          "id": "results:foaf:Agent"
        }
      ]
    },
    {
      "id": "results:dataset:source",
      "property": "http://purl.org/dc/terms/source",
      "label": {
        "en": "Dataset",
        "sv": "Datamängd",
        "da": "Datasæt",
        "nb": "Datasett",
        "de": "Datensatz"
      },
      "description": {
        "en": "This dataset was used to produce the result."
      },
      "constraints": {
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/ns/dcat#Dataset"
      },
      "type": "choice",
      "nodetype": "RESOURCE",
      "cardinality": {
        "min": 1,
        "pref": 1
      }
    },
    {
      "type": "text",
      "id": "results:dcterms:title",
      "extends": "dcterms:title",
      "cardinality": {
        "min": 1,
        "pref": 0
      },
      "description": {
        "en": "This property contains a name given to the result. This property can be repeated for parallel language versions of the name."
      },
      "nodetype": "LANGUAGE_LITERAL",
      "label": {
        "sv": "Titel",
        "en": "Title",
        "no": "Tittel",
        "de": "Titel"
      }
    },
    {
      "type": "text",
      "id": "results:dcterms:description",
      "extends": "dcterms:description",
      "styles": [
        "multiline"
      ],
      "cardinality": {
        "min": 1,
        "pref": 0
      },
      "description": {
        "en": "This property contains a free-text description of the reuslt. This property can be repeated for parallel language versions of the description."
      },
      "label": {
        "no": "Beskrivelse",
        "sv": "Beskrivning",
        "en": "Description",
        "de": "Beschreibung"
      }
    },
    {
      "type": "choice",
      "nodetype": "URI",
      "id": "results:foaf:Agent",
      "labelProperties": [
        "http://xmlns.com/foaf/0.1/name",
        [
          "http://xmlns.com/foaf/0.1/givenName",
          "http://xmlns.com/foaf/0.1/familyName"
        ]
      ],
      "property": "http://purl.org/dc/terms/contributor",
      "constraints": {
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
          "http://xmlns.com/foaf/0.1/Agent",
          "http://xmlns.com/foaf/0.1/Person",
          "http://xmlns.com/foaf/0.1/Organization"
        ]
      },
      "label": {
        "en": "Contributor",
        "sv": "Medverkande",
        "da": "Medvirkende",
        "de": "Mitwirkender"
      },
      "description": {
        "en": "This property refers to an entity (organisation) responsible for making the result available."
      },
      "cardinality": {
        "min": 0,
        "pref": 1,
        "max": 1
      }
    },
    {
      "id": "results:foaf:page",
      "property": "http://xmlns.com/foaf/0.1/page",
      "label": {
        "en": "Web page",
        "sv": "Webbsida",
        "da": "Hjemmeside",
        "nb": "Nettside",
        "de": "Webseite"
      },
      "description": {
        "en": "A page or document about this result."
      },
      "constraints": {
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
      },
      "type": "text",
      "nodetype": "URI",
      "cardinality": {
        "pref": 1
      },
      "styles": [
        "externalLink"
      ],
      "pattern": "https?://.+"
    },
    {
      "id": "results:dcterms:created",
      "extends": "dcterms:created",
      "type": "text"
    },
    {
      "type": "group",
      "nodetype": "RESOURCE",
      "id": "skosmos:labels",
      "label": {
        "en": "Labels",
        "sv": "Termer",
        "de": "Namen"
      },
      "items": [
        {
          "type": "text",
          "nodetype": "PLAIN_LITERAL",
          "extends": "skos:prefLabel",
          "cardinality": {
            "min": 0,
            "pref": 1
          }
        },
        {
          "type": "text",
          "nodetype": "PLAIN_LITERAL",
          "extends": "skos:altLabel"
        },
        {
          "type": "text",
          "nodetype": "PLAIN_LITERAL",
          "extends": "skos:hiddenLabel"
        }
      ],
      "styles": [
        "heading"
      ]
    },
    {
      "type": "group",
      "nodetype": "RESOURCE",
      "id": "skosmos:concept",
      "items": [
        {
          "id": "skos:conceptLabels"
        },
        {
          "id": "skos:conceptDocumentation"
        },
        {
          "id": "skosmos:relations"
        },
        {
          "id": "skos:conceptMappings"
        }
      ],
      "label": {
        "en": "Concept",
        "sv": "Begrepp",
        "de": "Begriff"
      }
    },
    {
      "type": "group",
      "nodetype": "RESOURCE",
      "id": "skosmos:relations",
      "items": [
        {
          "extends": "skos:related",
          "cardinality": {"pref": 1}
        },
        {
          "type": "choice",
          "nodetype": "URI",
          "extends": "skos:broader",
          "styles": [
            "nonEditable"
          ]
        },
        {
          "type": "choice",
          "nodetype": "URI",
          "extends": "skos:broaderTransitive",
          "styles": [
            "nonEditable"
          ]
        },
        {
          "type": "choice",
          "nodetype": "URI",
          "extends": "skos:narrower",
          "styles": [
            "nonEditable"
          ]
        },
        {
          "type": "choice",
          "nodetype": "URI",
          "extends": "skos:narrowerTransitive",
          "styles": [
            "nonEditable"
          ]
        },
        {
          "type": "choice",
          "nodetype": "URI",
          "extends": "skos:inScheme",
          "styles": [
            "nonEditable"
          ]
        },
        {
          "type": "choice",
          "nodetype": "URI",
          "extends": "skos:topConceptOf",
          "styles": [
            "nonEditable"
          ]
        }
      ],
      "label": {
        "en": "Relations",
        "sv": "Relationer",
        "de": "Beziehungen"
      },
      "styles": [
        "heading"
      ]
    },
    {
      "type": "group",
      "nodetype": "RESOURCE",
      "id": "skosmos:conceptScheme",
      "label": {
        "en": "Concept scheme",
        "sv": "Begreppsmodell",
        "de": "Begriffsmodell"
      },
      "items": [
        {
          "extends": "dcterms:title",
          "cardinality": {"min": 1}
        },
        {
          "extends": "dcterms:description",
          "cardinality": {"pref": 1}
        }
      ]
    },
    {
      "type": "group",
      "id": "esc:Ideas",
      "label": {
        "en": "Ideas",
        "sv": "Ideas",
        "de": "Ideas"
      },
      "constraints": {
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://entryscape.com/terms/#Idea"
      },
      "items": [
        {
          "id": "ideas:dcterms:title"
        },
        {
          "id": "ideas:dcterms:description"
        },
        {
          "id": "ideas:dataset:source"
        },
        {
          "id": "ideas:foaf:page"
        },
        {
          "id": "ideas:dcterms:created"
        },
        {
          "id": "ideas:foaf:Agent"
        }
      ]
    },
    {
      "id": "ideas:dataset:source",
      "property": "http://purl.org/dc/terms/source",
      "label": {
        "en": "Dataset",
        "sv": "Datamängd",
        "da": "Datasæt",
        "nb": "Datasett",
        "de": "Datensatz"
      },
      "description": {
        "en": "This dataset was used to produce the idea."
      },
      "constraints": {
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.w3.org/ns/dcat#Dataset"
      },
      "type": "choice",
      "nodetype": "RESOURCE",
      "cardinality": {
        "min": 0,
        "pref": 1
      }
    },
    {
      "type": "text",
      "id": "ideas:dcterms:title",
      "extends": "dcterms:title",
      "cardinality": {
        "min": 1,
        "pref": 0
      },
      "description": {
        "en": "This property contains a name given to the idea. This property can be repeated for parallel language versions of the name."
      },
      "nodetype": "LANGUAGE_LITERAL",
      "label": {
        "sv": "Titel",
        "en": "Title",
        "no": "Tittel",
        "de": "Titel"
      }
    },
    {
      "type": "text",
      "id": "ideas:dcterms:description",
      "extends": "dcterms:description",
      "styles": [
        "multiline"
      ],
      "cardinality": {
        "min": 1,
        "pref": 0
      },
      "description": {
        "en": "This property contains a free-text description of the reuslt. This property can be repeated for parallel language versions of the description."
      },
      "label": {
        "no": "Beskrivelse",
        "sv": "Beskrivning",
        "en": "Description",
        "de": "Beschreibung"
      }
    },
    {
      "type": "choice",
      "nodetype": "URI",
      "id": "ideas:foaf:Agent",
      "labelProperties": [
        "http://xmlns.com/foaf/0.1/name",
        [
          "http://xmlns.com/foaf/0.1/givenName",
          "http://xmlns.com/foaf/0.1/familyName"
        ]
      ],
      "property": "http://purl.org/dc/terms/contributor",
      "constraints": {
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
          "http://xmlns.com/foaf/0.1/Agent",
          "http://xmlns.com/foaf/0.1/Person",
          "http://xmlns.com/foaf/0.1/Organization"
        ]
      },
      "label": {
        "en": "Contributor",
        "sv": "Medverkande",
        "da": "Medvirkende",
        "de": "Mitwirkender"
      },
      "description": {
        "en": "This property refers to an entity (organisation) responsible for making the idea available."
      },
      "cardinality": {
        "min": 0,
        "pref": 1,
        "max": 1
      }
    },
    {
      "id": "ideas:foaf:page",
      "property": "http://xmlns.com/foaf/0.1/page",
      "label": {
        "en": "Web page",
        "sv": "Webbsida",
        "da": "Hjemmeside",
        "nb": "Nettside",
        "de": "Webseite"
      },
      "description": {
        "en": "A page or document about this idea."
      },
      "constraints": {
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://xmlns.com/foaf/0.1/Document"
      },
      "type": "text",
      "nodetype": "URI",
      "cardinality": {
        "pref": 1
      },
      "styles": [
        "externalLink"
      ],
      "pattern": "https?://.+"
    },
    {
      "id": "ideas:dcterms:created",
      "extends": "dcterms:created",
      "type": "text"
    }
  ]
});
