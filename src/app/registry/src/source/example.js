/* eslint no-tabs: "off" */
export default '<?xml version="1.0"?>' +
'<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
'	xmlns:dcterms="http://purl.org/dc/terms/"' +
'	xmlns:dcat="http://www.w3.org/ns/dcat#"' +
'	xmlns:foaf="http://xmlns.com/foaf/0.1/"' +
'	xmlns:adms="http://www.w3.org/ns/adms#"' +
'	xmlns:vcard="http://www.w3.org/2006/vcard/ns#"' +
'	xmlns:schema="http://schema.org/"' +
'	xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">' +
'  <rdf:Description rdf:about="http://nobelprize.org/datasets/dcat#catalog">' +
'    <rdf:type rdf:resource="http://www.w3.org/ns/dcat#Catalog"/>' +
'    <dcterms:title xml:lang="en">Nobel Media Dataset catalog</dcterms:title>' +
'    <dcterms:description>A range of datasets maintained by Nobel Media AB </dcterms:description>' +
'    <dcat:themeTaxonomy rdf:resource="http://eurovoc.europa.eu/"/>' +
'    <dcat:dataset rdf:resource="http://nobelprize.org/datasets/dcat#ds1"/>' +
'    <dcterms:publisher rdf:resource="http://nobelprize.org/datasets/dcat#agent1"/>' +
'    <dcterms:issued>2014-09-25</dcterms:issued>' +
'    <dcterms:language rdf:resource="http://id.loc.gov/vocabulary/iso639-1/en"/>' +
'    <dcterms:modified>2014-09-25</dcterms:modified>' +
'    <foaf:homepage>http://data.nobelprize.org/</foaf:homepage>' +
'    <dcterms:license rdf:resource="http://creativecommons.org/publicdomain/zero/1.0/"/>' +
'  </rdf:Description>' +
'  <rdf:Description rdf:about="http://nobelprize.org/datasets/dcat#ds1">' +
'    <rdf:type rdf:resource="http://www.w3.org/ns/dcat#Dataset"/>' +
'    <dcterms:title xml:lang="en">Linked Nobel prizes</dcterms:title>' +
'    <dcterms:description>This dataset contains Nobel prizes, Nobel laureates and information about related media resources. </dcterms:description>' +
'    <adms:contactPoint rdf:nodeID="_n1"/>' +
'    <dcat:keyword>Nobel prize</dcat:keyword>' +
'    <dcat:keyword>prize</dcat:keyword>' +
'    <dcat:keyword>science</dcat:keyword>' +
'    <dcterms:publisher rdf:nodeID="_n2"/>' +
'    <dcat:theme rdf:resource="http://eurovoc.europa.eu/100142"/>' +
'    <dcat:distribution rdf:resource="http://nobelprize.org/datasets/dcat#dist1"/>' +
'    <dcterms:issued>2014-01-15</dcterms:issued>' +
'    <dcterms:modified>2014-08-27</dcterms:modified>' +
'    <dcterms:language rdf:resource="http://publications.europa.eu/resource/authority/language/ENG"/>' +
'    <dcat:landingPage rdf:resource="http://data.nobelprize.org/"/>' +
'    <dcterms:conformsTo rdf:resource="http://www.nobelprize.org/nobel_organizations/nobelmedia/nobelprize_org/developer/manual-linkeddata/terms.html"/>' +
'    <dcterms:temporal rdf:nodeID="_n3"/>' +
'    <dcterms:spatial rdf:resource="http://sws.geonames.org/2673730"/>' +
'    <dcterms:accrualPeriodicity rdf:resource="http://purl.org/cld/freq/daily"/>' +
'  </rdf:Description>' +
'  <rdf:Description rdf:nodeID="_n1">' +
'    <rdf:type rdf:resource="http://www.w3.org/2006/vcard/ns#Organization"/>' +
'    <vcard:fn>Nobel Media AB</vcard:fn>' +
'    <vcard:hasTelephone rdf:nodeID="_n4"/>' +
'    <vcard:hasAddress rdf:nodeID="_n5"/>' +
'    <vcard:hasEmail rdf:resource="mailto:info@nobelmedia.org"/>' +
'  </rdf:Description>' +
'  <rdf:Description rdf:nodeID="_n4">' +
'    <vcard:hasValue rdf:resource="tel:086631722"/>' +
'    <rdf:type rdf:resource="http://www.w3.org/2006/vcard/ns#Voice"/>' +
'    <rdf:type rdf:resource="http://www.w3.org/2006/vcard/ns#Work"/>' +
'  </rdf:Description>' +
'  <rdf:Description rdf:nodeID="_n5">' +
'    <rdf:type rdf:resource="http://www.w3.org/2006/vcard/ns#Address"/>' +
'    <vcard:street-address>Stureg. 14</vcard:street-address>' +
'    <vcard:postal-code>11436</vcard:postal-code>' +
'    <vcard:locality>Stockholm</vcard:locality>' +
'    <vcard:country-name>Sweden</vcard:country-name>' +
'  </rdf:Description>' +
'  <rdf:Description rdf:about="http://nobelprize.org/datasets/dcat#dist1">' +
'    <rdf:type rdf:resource="http://www.w3.org/ns/dcat#Distribution"/>' +
'    <dcterms:title xml:lang="en">Linked Data endpoint</dcterms:title>' +
'    <dcterms:description xml:lang="en">Provides browsable linked data and a SPARQL endpoint.</dcterms:description>' +
'    <dcat:accessURL rdf:resource="http://data.nobelprize.org/"/>' +
'    <dcterms:license rdf:resource="http://creativecommons.org/licenses/by-nc/3.0/"/>' +
'    <dcterms:format>application/rdf+xml</dcterms:format>' +
'    <dcterms:format>application/sparql-query</dcterms:format>' +
'  </rdf:Description>' +
'  <rdf:Description rdf:nodeID="_n3">' +
'    <rdf:type rdf:resource="http://purl.org/dc/terms/PeriodOfTime"/>' +
'    <schema:startDate rdf:datatype="http://www.w3.org/2001/XMLSchema#date">1905-03-01</schema:startDate>' +
'    <schema:endDate rdf:datatype="http://www.w3.org/2001/XMLSchema#date">2013-01-05</schema:endDate>' +
'  </rdf:Description>' +
'  <rdf:Description rdf:about="http://sws.geonames.org/2673730">' +
'    <rdfs:label>Stockholm</rdfs:label>' +
'  </rdf:Description>' +
'  <rdf:Description rdf:about="http://nobelprize.org/datasets/dcat#agent1">' +
'    <rdf:type rdf:resource="http://xmlns.com/foaf/0.1/Agent"/>' +
'    <foaf:name>Nobel Media AB</foaf:name>' +
'    <dcterms:type rdf:resource="http://purl.org/adms/publishertype/Company"/>' +
'  </rdf:Description>' +
'  <rdf:Description rdf:nodeID="_n2">' +
'    <rdf:type rdf:resource="http://xmlns.com/foaf/0.1/Agent"/>' +
'    <foaf:name>Nobel Media AB</foaf:name>' +
'    <dcterms:type rdf:resource="http://purl.org/adms/publishertype/Company"/>' +
'  </rdf:Description>' +
'</rdf:RDF>';
