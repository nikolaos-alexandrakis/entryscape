import CollapsableCard from 'commons/components/bootstrap/Collapse/Card';
import Title from 'commons/components/common/Title';
import './style.css';

export default () => {
  return {
    view(vnode) {
      const { cards, title, subtitle, hx = 'h3', button } = vnode.attrs;
      return <div>
        {title ? <Title title={title} subtitle={subtitle} hx={hx} button={button}/> : null}
        <hr className="mt-1"/>
        <div className="accordion">
          {cards.map((card, idx) => <CollapsableCard card={card} id={`harvesting-list-${idx}`}/>)}
        </div>
      </div>;
    },
  };
};
