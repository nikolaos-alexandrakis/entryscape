export default {
  templates: [
    {
      type: 'group',
      nodetype: 'RESOURCE',
      id: 'faq:Question',
      constraints: {
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://schema.org/Question',
      },
      label: {
        en: 'Question',
      },
      items: [
        {
          type: 'text',
          nodetype: 'LANGUAGE_LITERAL',
          extends: 'dcterms:title',
          styles: [
            'multiline',
          ],
          cardinality: {
            min: 1,
            pref: 0,
          },
          label: {
            en: 'Question',
          },
        },
        {
          type: 'choice',
          nodetype: 'LITERAL',
          extends: 'dcterms:subject',
          property: 'http://schema.org/Category',
          cardinality: {
            min: 0,
            pref: 0,
          },
          constraints: {
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.w3.org/2004/02/skos/core#Concept',
          },
          label: {
            en: 'category',
          },
        },
      ],
    },
    {
      type: 'group',
      nodetype: 'RESOURCE',
      id: 'faq:Answer',
      constraints: {
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://schema.org/Answer',
      },
      label: {
        en: 'Answer',
      },
      items: [
        {
          type: 'text',
          nodetype: 'LANGUAGE_LITERAL',
          extends: 'sc:text',
          styles: [
            'noLabelInPresent',
            'multiline',
          ],
          cardinality: {
            min: 1,
            pref: 0,
          },
        },
      ],
    },
    {
      id: 'sc:text',
      property: 'http://schema.org/Answer',
      label: {
        en: 'Answer',
      },
      description: {
        en: 'Answer.',
      },
      type: 'text',
      nodetype: 'LANGUAGE_LITERAL',
    },

  ],
};
