import Sandbox from 'catalog/visualization/components/Sandbox/index';
import params from 'blocks/boot/params';
import config from 'blocks/config/config';


export default (node, data) => {
  params.onInit((urlParams) => {
    const context = data.context || urlParams.context || config.econfig.context;
    m.mount(node, { view: () => m(Sandbox, context ? { context } : {}) });
  });
};
