define({
  "namespaces": {
    "dbo": "http://dbpedia.org/ontology/",
  },
  "templates": [
    {
      "id": "dbo:Person",
      "label": {
        "en": "Person"
      },
      "constraints": {
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "dbo:Person"
      },
      "description": {
        "en": "A person."
      },
      "type": "group",
      "items": [
        "dbpo:thumbnail",
        "dbpo:birthName",
        "dbpo:deathDate",
        "dbpo:works",
        "foaf:depiction",
        "foaf:knows",
        "foaf:made",
      ]
    },
  ],
  "root": "dbo:Person"
});
