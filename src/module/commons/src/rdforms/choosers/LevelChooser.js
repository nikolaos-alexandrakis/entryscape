import m from 'mithril';
import escoRdforms from 'commons/nls/escoRdforms.nls';
import { i18n } from 'esi18n';
import {renderingContext} from 'rdforms';
import Spatial from './components/Spatial';

let defaultRegistered = false;

const LevelChooser = {
  editor(node, binding, context) {
    const bundle = i18n.getLocalization(escoRdforms);
    m.mount(node, {
      view: () => m(Spatial, {
        binding,
        editable: true,
        bundle,
        context,
      }),
    });
  },
  presenter(node, binding, context) {
    const bundle = i18n.getLocalization(escoRdforms);
    m.mount(node, {
      view: () => m(
        Spatial, {
          binding,
          editable: false,
          bundle,
          context,
        },
      ),
    });
  },
  registerDefaults() {
    if (!defaultRegistered) {
      defaultRegistered = true;
      renderingContext.editorRegistry
        .item({ getId() { return 'dcatde:spatial'; } })
        .register(LevelChooser.editor);
      renderingContext.presenterRegistry
        .item({ getId() { return 'dcatde:spatial'; } })
        .register(LevelChooser.presenter);
    }
  },
};

export { LevelChooser };
export default LevelChooser;
