import Input from './Input';

/**
 */
export default () => ({
  view(vnode) {
    const { name, id, label, checked, input = { type: 'radio' }, onclick } = vnode.attrs;

    input.id = `${id}Input${label}`;
    input.name = `${name}Input`;
    input.classNames = [];
    input.required = false;
    input.checked = checked;

    return <label id={id} key={id} className="radio-inline mr-3" name={name} onclick={onclick} data-recipe={label}>
      <Input input={input}/>
      <span>{label}</span>
    </label>;
  },
});
