import './style.css'

export default () => {
  return {
    view(vnode) {
      const { body, title, date, id, type } = vnode.attrs.card;

      const headerId = `card-header--${id}`;
      const collapseId = `card-body--${id}`;
      const borderClass = `border-${type}`;

      return <div className={`card ${borderClass}`}>
        <div className="card-header" id={headerId}>
          <a
            className="collapsed spaExplicitLink"
            data-toggle="collapse"
            data-target={`#${collapseId}`}
            aria-expanded="false"
            aria-controls={collapseId}>
            <i className="float-left fas fa-fw"/>
            <span>{title}</span>
            <span className={'card__headerDAte'}>{date}</span>
          </a>
        </div>
        <div
          id={collapseId}
          className="collapse"
          aria-labelledby={headerId}>
          <div className="card-body">{body}</div>
        </div>
      </div>;
    },
  };
};
