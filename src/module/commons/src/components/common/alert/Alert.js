import m from 'mithril';

/**
 * A component for Bootstrap Alerts
 * @see ./Alert.md
 */
const Alert = {
  view(vnode) {
    const {element = 'div', type = 'info', text, children, classNames = []} = vnode.attrs;
    return m(`${element}.alert.alert-${type}`, {class: classNames.join(' '), role: 'alert'}, [
      m('span', text),
      children,
    ]);
  },
};

export default Alert;
