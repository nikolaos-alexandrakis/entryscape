const commonProperties = ['innerHTML', 'innerText', 'src'];
const htmlUtil = {
  toggleAttribute(nodes, attr, value) {
    nodes.forEach(n => (n.hasAttribute(attr) ? n.removeAttribute(attr) : n.setAttribute(attr, value)));
  },

  toggleEnabledDisabled(domNodes) {
    this.toggleAttribute(domNodes, 'disabled', 'disabled');
  },

  /**
   * @param {string} type
   * @param {object} attributes
   * @param {Node} parent
   * @param {boolean|Node} before - An optional argument to specify the position of the node.
   * If true, then insert first and if instance of Node insert before the given node.
   *
   * @returns {Node}
   */
  create(type, attributes, parent, before = null) {
    const newDOMNode = document.createElement(type);

    if (attributes) {
      Object.entries(attributes)
        .forEach((keyVal) => {
          if (commonProperties.includes(keyVal[0])) {
            newDOMNode[keyVal[0]] = keyVal[1];
          } else if (keyVal[0] === 'class') {
            htmlUtil.addClass(newDOMNode, keyVal[1]);
          } else {
            newDOMNode.setAttribute(keyVal[0], keyVal[1]);
          }
        });
    }
    if (parent) {
      if (before instanceof Node) {
        parent.insertBefore(newDOMNode, before);
      } else if (before === true) {
        parent.insertBefore(newDOMNode, parent.firstChild);
      } else if (before === 'after') {
        parent.parentNode.insertBefore(newDOMNode, parent.nextSibling);
      } else {
        parent.appendChild(newDOMNode);
      }
    }

    return newDOMNode;
  },
  addClass(node, classes) {
    const allClasses = classes.split(' ');

    allClasses.forEach((clas) => {
      if (clas.length > 0) { // clas must not be empty, see classList.add
        node.classList.add(clas);
      }
    });

    return node;
  },
  removeClass(node, classes) {
    const allClasses = classes.split(' ');

    allClasses.forEach(clas => node.classList.remove(clas));

    return node;
  },
  preventBubbleWrapper(onClick) {
    return (e, args) => {
      e.preventDefault();
      e.stopPropagation();
      const argsArray = Array.isArray(args) ? args : [args];
      onClick && onClick.apply(null, argsArray);
    }
  },
};

export default htmlUtil;
