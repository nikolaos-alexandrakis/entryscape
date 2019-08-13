import './style.scss';

export default () => ({
  view(vnode) {
    const {
      title,
      subTitle,
      cardId,
      backgroundType = 'white',
      className = '',
      onclick = () => {},
    } = vnode.attrs;
    const headerId = `card-header--${cardId}`;
    const collapseId = `card-body--${cardId}`;
    const borderClass = `bg-${backgroundType}`;

    return <div className={`collapsable mb-2 ${className}`}>
      <div className={`collapseHeader ${borderClass}`} id={headerId}>
        <a
          className="collapsed spaExplicitLink d-flex justify-content-between"
          data-toggle="collapse"
          data-target={`#${collapseId}`}
          aria-expanded="false"
          aria-controls={collapseId}
          onclick={onclick}
        >
          <span className="d-flex align-items-center">
            <i className="title float-left fas fa-fw mr-1"/>
            {title}
          </span>
          <span className={'subTitle d-flex align-items-center justify-content-end'}>
            {subTitle}
          </span>
        </a>
      </div>
      <div
        id={collapseId}
        className="collapse"
        aria-labelledby={headerId}
      >
        <div className="card-body">{vnode.children}</div>
      </div>
    </div>;
  },
});
