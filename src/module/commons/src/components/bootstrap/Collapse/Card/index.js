import './style.css';

export default () => ({
  view(vnode) {
    const { body, title, date, id, type } = vnode.attrs.card;

    const headerId = `card-header--${id}`;
    const collapseId = `card-body--${id}`;
    const borderClass = `bg-${type}`;

    return <div className={'card mb-2'}>
      <div className={`card-header ${borderClass} text-white`} id={headerId}>
        <a
          className="collapsed spaExplicitLink d-flex justify-content-between"
          data-toggle="collapse"
          data-target={`#${collapseId}`}
          aria-expanded="false"
          aria-controls={collapseId}>
          <span className="d-flex align-items-center">
            <i className="float-left fas fa-fw mr-1"/>
            {title}
          </span>
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
});
