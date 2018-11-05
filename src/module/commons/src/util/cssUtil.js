const defaultParams = {
  noneBlock: {
    prop: 'display',
    val1: 'none',
    val2: 'block',
  },
  noneEmpty: {
    prop: 'display',
    val1: 'none',
    val2: '',
  }
}

const toggleClass = (nodes, cssClass) => {
  nodes.forEach(node => domClass.toggle(node, cssClass));
};

/**
 * Refers to the CSS property-value
 *
 * For a params = { property: 'display', val1: 'none', val2: '' }, all the nodes that have a
 * display:none will have that replaced with display: ''.
 *
 * @param nodes {HTMLElement|Array>}
 * @param params {Object}
 */
const togglePropertyValue = (nodes = [], params) => {
  const {prop, val1, val2} = params;

  const applyToggle = (node) => {
    const val = node.style.getPropertyValue(prop);

    if (val === val1) {
      node.style.setProperty(prop, val2);
    } else if (val === val2) {
      node.style.setProperty(prop, val1);
    }
  }

  Array.isArray(nodes) ? nodes.forEach(applyToggle) : applyToggle(nodes);
};

const toggleDisplayNoneBlock = nodes => togglePropertyValue(nodes, defaultParams.noneBlock);
const toggleDisplayNoneEmpty = nodes => togglePropertyValue(nodes, defaultParams.noneEmpty);

export {
  toggleClass,
  togglePropertyValue,
  toggleDisplayNoneBlock,
  toggleDisplayNoneEmpty,
};


export default {
  toggleClass,
  togglePropertyValue,
  toggleDisplayNoneBlock,
  toggleDisplayNoneEmpty,
}
