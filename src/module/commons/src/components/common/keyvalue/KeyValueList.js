export default () => ({
  view(vnode) {
    const { data, dtClass = '', ddClass = '', asBadge = false } = vnode.attrs;

    const items = [];
    Object.keys(data).forEach((key) => {
      items.push(<dt className={`${dtClass} col-sm-3`}>{key}</dt>);
      items.push(<dd className={`${ddClass} col-sm-9`}>{asBadge ?
        <span className="badge badge-pill badge-primary">{data[key]}</span> : data[key]}</dd>);
    });

    return <dl className="row">{items}</dl>;
  },
});
