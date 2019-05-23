import { namespaces as ns } from 'rdfjson';

ns.add('cld', 'http://purl.org/cld/freq/');
ns.add('freq', 'http://publications.europa.eu/resource/authority/frequency/');
ns.add('adms', 'http://www.w3.org/ns/adms#');
ns.add('dcat', 'http://www.w3.org/ns/dcat#');
ns.add('eurovoc', 'http://eurovoc.europa.eu/');
ns.add('dtheme', 'http://publications.europa.eu/resource/authority/data-theme/');

const config = {
  'adms:contactPoint': 'dcat:contactPoint',
  'adms:version': 'owl:versionInfo',
  'dcat:themeTaxonomy': {
    'eurovoc:domains': 'http://publications.europa.eu/resource/authority/data-theme',
  },
  'dcat:theme': {
    'eurovoc:100142': 'dtheme:GOVE', // 04 POLITICS
    'eurovoc:100143': 'dtheme:INTR', // 08 INTERNATIONAL RELATIONS
    'eurovoc:100144': 'dtheme:GOVE', // 10 EUROPEAN UNION
    'eurovoc:100145': 'dtheme:JUST', // 12 LAW
    'eurovoc:100146': 'dtheme:ECON', // 16 ECONOMICS
    'eurovoc:100147': 'dtheme:ECON', // 20 TRADE
    'eurovoc:100148': 'dtheme:ECON', // 24 FINANCE
    'eurovoc:100149': 'dtheme:SOCI', // 28 SOCIAL QUESTIONS
    'eurovoc:100150': 'dtheme:EDUC', // 32 EDUCATION AND COMMUNICATIONS
    'eurovoc:100151': 'dtheme:TECH', // 36 SCIENCE
    'eurovoc:100152': 'dtheme:ECON', // 40 BUSINESS AND COMPETITION
    'eurovoc:100153': 'dtheme:SOCI', // 44 EMPLOYMENT AND WORKING CONDITIONS
    'eurovoc:100154': 'dtheme:TRAN', // 48 TRANSPORT
    'eurovoc:100155': 'dtheme:ENVI', // 52 ENVIRONMENT
    'eurovoc:100156': 'dtheme:AGRI', // 56 AGRICULTURE, FORESTRY AND FISHERIES
    'eurovoc:100157': 'dtheme:AGRI', // 60 AGRI-FOODSTUFFS
    'eurovoc:100158': 'dtheme:TECH', // 64 PRODUCTION, TECHNOLOGY AND RESEARCH
    'eurovoc:100159': 'dtheme:ENER', // 66 ENERGY
    'eurovoc:100160': 'dtheme:ECON', // 68 INDUSTRY   -- not a good match
    'eurovoc:100161': 'dtheme:REGI', // 72 GEOGRAPHY  -- not a good match
    'eurovoc:100162': 'dtheme:INTR', // 76 INTERNATIONAL ORGANISATIONS
  },
  'dcterms:accrualPeriodicity': {
    'cld:annual': 'freq:ANNUAL',
    'cld:biennial': 'freq:BIENNIAL',
    'cld:bimonthly': 'freq:BIMONTHLY',
    'cld:biweekly': 'freq:BIWEEKLY',
    'cld:continuous': 'freq:CONT',
    'cld:daily': 'freq:DAILY',
    'cld:irregular': 'freq:IRREG',
    'cld:monthly': 'freq:MONTHLY',
    'cld:quarterly': 'freq:QUARTERLY',
    'cld:semiannual': 'freq:ANNUAL_2',
    'cld:semimonthly': 'freq:MONTHLY_2',
    'cld:semiweekly': 'freq:WEEKLY_2',
    'cld:threeTimesAMonth': 'freq:MONTHLY_3',
    'cld:threeTimesAWeek': 'freq:WEEKLY_3',
    'cld:threeTimesAYear': 'freq:ANNUAL_3',
    'cld:triennial': 'freq:TRIENNIAL',
    'cld:weekly': 'freq:WEEKLY',
  },
};

const c = {};
let v = {};
let nv = {};

Object.keys(config).forEach((k) => {
  v = config[k];
  if (typeof v === 'string') {
    c[ns.expand(k)] = ns.expand(v);
  } else {
    nv = {};
    c[ns.expand(k)] = nv;
    Object.keys(v).forEach((o) => {
      nv[ns.expand(o)] = ns.expand(v[o]);
    });
  }
});

export default c;
