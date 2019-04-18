import m from 'mithril';

export default () => ({
  view(vnode) {
    const { value, className, href } = vnode.attrs.item;
    return (
      <li 
        class={`${className} breadcrumb-item`}
        key={value}
      >
        {href ? (
          <a href={href}>{value}</a>
        ) : (
          <span title={value}>{value}</span>
        )}
      </li>
    );
  },
});
