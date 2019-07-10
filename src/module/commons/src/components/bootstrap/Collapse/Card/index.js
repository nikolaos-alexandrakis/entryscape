import './style.scss';

export default () => ({
  view(vnode) {
    const { body, title, date, cardId, type = 'light' } = vnode.attrs;
    const headerId = `card-header--${cardId}`;
    const collapseId = `card-body--${cardId}`;
    const borderClass = `bg-${type}`;

    return <div className={'collapsableCard card mb-2'}>
      <div className={`${borderClass}`} id={headerId}>
        <a
          className="card-header collapsed spaExplicitLink d-flex justify-content-between"
          data-toggle="collapse"
          data-target={`#${collapseId}`}
          aria-expanded="false"
          aria-controls={collapseId}>
          <span className="d-flex align-items-center">
            <i className="title float-left fas fa-fw mr-1"/>
            {title}
          </span>
          <span className={'card__headerDAte'}>{date}</span>
        </a>
      </div>
      <div
        id={collapseId}
        className="collapse"
        aria-labelledby={headerId}>
        <div className="card-body">{body}{vnode.children}</div>
      </div>
    </div>;
  },
});
