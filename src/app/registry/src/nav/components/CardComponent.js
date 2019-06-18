export default () => ({
  view(vnode) {
    const {
      id,
      title,
      text,
      faClass,
      onclick,
    } = vnode.attrs;

    return <div className={`${id}__card card`} style="width: calc(50% - 0.5em); margin: 0.25em;" onclick={onclick}>
      <i className={`${id}__cardIcon float-right fas fa-2x fa-${faClass}`}/>
      <h4 className={`${id}__cardHeader`}>{title}</h4>
      <p className={`${id}__cardParagraph`}>{text}</p>
    </div>;
  },
});
