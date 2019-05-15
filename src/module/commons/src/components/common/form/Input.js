import m from 'mithril';

/**
 * https://www.w3schools.com/bootstrap/bootstrap_ref_css_buttons.asp
 * element : HTML element to use for button
 * type : btn-?
 * text : text in button
 * className : a single class name TODO make array
 * onclick : function
 *
 * @type {{view: ((vnode))}}
 */
const Input = {
  view(vnode) {
    const {
      type = 'text',
      name,
      id,
      placeholder = undefined,
      checked = false,
      required = true,
      disabled = false,
      readonly = false,
      autocomplete,
      onkeyup,
      oninput,
      onchange,
      onvalue,
      value = null,
      classNames = ['form-control'],
    } = vnode.attrs.input;

    const attrs = { type, id, name, class: classNames.join(' ') };

    // TODO refactor
    if (typeof checked === 'boolean') {
      attrs.checked = checked;
    }
    if (typeof required === 'boolean') {
      attrs.required = required;
    }
    if (typeof disabled === 'boolean') {
      attrs.disabled = disabled;
    }
    if (typeof readonly === 'boolean') {
      attrs.readonly = readonly;
    }

    if (placeholder) {
      attrs.placeholder = placeholder;
    }
    if (onkeyup) {
      attrs.onkeyup = onkeyup;
    }
    if (oninput || onvalue) {
      attrs.oninput = (ie) => {
        if (oninput) {
          oninput(ie);
        }
        if (onvalue) {
          onvalue(ie.currentTarget.value);
        }
      };
    }
    if (onchange) {
      attrs.onchange = onchange;
    }
    if (onvalue) {

    }
    if (typeof value === 'string') {
      attrs.value = value;
    }
    if (autocomplete) {
      attrs.autocomplete = autocomplete;
    }

    return m('input', attrs);
  },
};

export default Input;
