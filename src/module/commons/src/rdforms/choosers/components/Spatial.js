import m from 'mithril';
import Select from 'commons/components/common/form/Select';
import { namespaces } from 'rdfjson';
import registry from 'commons/registry';
import { engine } from 'rdforms';
import RDForm from './RDForm';
import GeoCoordinates from './GeoCoordinates';
import '../escoSpatial.css';

namespaces.add('dcatde', 'http://dcat-ap.de/def/dcatde/1.0/');
namespaces.add('pgcl', 'http://dcat-ap.de/def/politicalGeocoding/Level/');
namespaces.add('pgsk', 'http://dcat-ap.de/def/politicalGeocoding/stateKey/');
const levelPred = 'dcatde:politicalGeocodingLevelURI';
const polPred = 'dcatde:politicalGeocodingURI';
const itemstore = registry.get('itemstore');

// Bundesländer / states
const bundItem = itemstore.createItem({
  id: 'bundesland',
  property: namespaces.expand(polPred),
  type: 'choice',
  nodetype: 'URI',
  choices: [
    { value: 'pgsk:01', label: { de: 'Schleswig-Holstein' } },
    { value: 'pgsk:02', label: { de: 'Hamburg' } },
    { value: 'pgsk:03', label: { de: 'Niedersachsen' } },
    { value: 'pgsk:04', label: { de: 'Bremen' } },
    { value: 'pgsk:05', label: { de: 'Nordrhein-Westfalen' } },
    { value: 'pgsk:06', label: { de: 'Hessen' } },
    { value: 'pgsk:07', label: { de: 'Rheinland-Pfalz' } },
    { value: 'pgsk:08', label: { de: 'Baden-Württemberg' } },
    { value: 'pgsk:09', label: { de: 'Bayern' } },
    { value: 'pgsk:10', label: { de: 'Saarland' } },
    { value: 'pgsk:11', label: { de: 'Berlin' } },
    { value: 'pgsk:12', label: { de: 'Brandenburg' } },
    { value: 'pgsk:13', label: { de: 'Mecklenburg-Vorpommern' } },
    { value: 'pgsk:14', label: { de: 'Sachsen' } },
    { value: 'pgsk:15', label: { de: 'Sachsen-Anhalt' } },
    { value: 'pgsk:16', label: { de: 'Thüringen' } },
  ],
  styles: ['strictmatch'],
}, false, true);
const bundItemGroup = itemstore.createTemplateFromChildren([bundItem]);

// District / Kreise
const districtItem = itemstore.createItem({
  id: 'landkreise',
  property: namespaces.expand(polPred),
  type: 'choice',
  nodetype: 'URI',
  pattern: 'http://dcat-ap.de/def/politicalGeocoding/districtKey/.*',
  constraints: {
    'rdf:type': 'skos:Concept',
    'skos:inScheme': 'http://dcat-ap.de/def/politicalGeocoding/districtKey',
  },
}, false, true);
const districtItemGroup = itemstore.createTemplateFromChildren([districtItem]);

// Municipalities / region
const municipalityItem = itemstore.createItem({
  id: 'municipality',
  property: namespaces.expand(polPred),
  type: 'choice',
  nodetype: 'URI',
  pattern: 'http://dcat-ap.de/def/politicalGeocoding/regionalKey/.*',
  constraints: {
    'rdf:type': 'skos:Concept',
    'skos:inScheme': 'http://dcat-ap.de/def/politicalGeocoding/regionalKey',
  },
}, false, true);
const municipalityItemGroup = itemstore.createTemplateFromChildren([municipalityItem]);


const Spatial = (vnode) => {
  const { binding, editable, bundle, context } = vnode.attrs;

  const graph = binding.getGraph();
  let currentPolLevel = graph.findFirstValue(null, levelPred);
  if (currentPolLevel) {
    currentPolLevel = namespaces.shortenKnown(currentPolLevel);
  }
  const root = binding.getParent().getChildrenRootUri();
  // Bundesland binding
  const bundGroupBinding = engine.match(graph, root, bundItemGroup);
  if (bundGroupBinding.getChildBindings().length === 0) {
    engine.create(bundGroupBinding, bundItem);
  }
  const bundBinding = bundGroupBinding.getChildBindings()[0];
  // Kreis binding
  const districtGroupBinding = engine.match(graph, root, districtItemGroup);
  if (districtGroupBinding.getChildBindings().length === 0) {
    engine.create(districtGroupBinding, districtItem);
  }
  const districtBinding = districtGroupBinding.getChildBindings()[0];
  // Municipality binding
  const municipalityGroupBinding = engine.match(graph, root, municipalityItemGroup);
  if (municipalityGroupBinding.getChildBindings().length === 0) {
    engine.create(municipalityGroupBinding, municipalityItem);
  }
  const municipalityBinding = municipalityGroupBinding.getChildBindings()[0];

  // Spatial boundingbox / Point
  const bbGroupItem = itemstore.getItem('dcat:dcterms:spatial_bb_da');
  const bbGroupBinding = engine.match(graph, root, bbGroupItem);
  if (bbGroupBinding.getChildBindings().length === 0) {
    engine.create(bbGroupBinding, bbGroupItem.getChildren()[0]);
  }
  const bbBinding = bbGroupBinding.getChildBindings()[0];

  // NOT USED anywhere
  // const updateGeoCoordinates = (coords) => {
  //   bbBinding.setValue(coords);
  //   m.redraw();
  //   return true;
  // };

  context.clear = () => {
    graph.findAndRemove(null, levelPred);
    currentPolLevel = undefined;
    bbBinding.setValue('');
    bundBinding.setValue('');
    districtBinding.setValue('');
    municipalityBinding.setValue('');
  };

  return {
    view() {
      if (editable) {
        const card = binding.getItem().getCardinality() || {};
        const min = card.min || 0;
        const pref = card.pref || 0;
        if ((context.view.includeLevel === 'mandatory' && min === 0)
          || (context.view.includeLevel === 'recommended' && min === 0 && pref === 0)) {
          if (!currentPolLevel && !bbBinding.isValid() && !bundBinding.isValid() &&
            !districtBinding.isValid() && !municipalityBinding.isValid()) {
            context.labelNode.style.display = 'none';
            return m('span');
          }
        }
        context.labelNode.style.display = '';
        let comp;
        if (currentPolLevel === 'pgcl:state') {
          comp = m('div', null, [
            m('.rdformsLabel', {}, 'Bundesland'),
            m(RDForm, { binding: bundBinding, editable: true }),
          ]);
        } else if (currentPolLevel === 'pgcl:administrativeDistrict') {
          comp = m('div', null, [
            m('.rdformsLabel', {}, 'Landkreise'),
            m(RDForm, { binding: districtBinding, editable: true }),
          ]);
        } else if (currentPolLevel === 'pgcl:municipality') {
          comp = m('div', null, [
            m('.rdformsLabel', {}, 'Kommun'), // TODO check with hannes.
            m(RDForm, { binding: municipalityBinding, editable: true }),
          ]);
        }

        return m('.row', null, [
          m('.col-md-6', null, [
            m('.rdformsLabel', {}, 'Ebene der geopolitischen Abdeckung'),
            m(Select, {
              value: currentPolLevel,
              onchange: m.withAttr('value', (val) => {
                graph.findAndRemove(null, levelPred);
                graph.add(root, levelPred, val);
                currentPolLevel = val;
              }),
              options: [
                { value: 'pgcl:international', label: 'Internationale Ebene' },
                { value: 'pgcl:european', label: 'EU Ebene' },
                { value: 'pgcl:federal', label: 'Bundesebene' },
                { value: 'pgcl:state', label: 'Ebene der Bundesländer' },
                { value: 'pgcl:administrativeDistrict', label: 'Ebene der Landkreise' },
                { value: 'pgcl:municipality', label: 'Kommunale Ebene' },
              ],
            }),
            comp,
          ]),
          m('.col-md-6', null, [
            m(GeoCoordinates, { binding: bbBinding, editable: true, bundle }),
          ]),
        ]);
      }
      if (bbBinding.isValid()) {
        context.labelNode.style.display = '';
        return m('div', null,
          m(GeoCoordinates, { binding: bbBinding, editable: false, bundle }),
        );
      }
      context.labelNode.style.display = 'none';
      return m('span');
    },
  };
};

export default Spatial;
