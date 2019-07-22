import CollapsableCard from 'commons/components/bootstrap/Collapse/Card';
import Title from 'commons/components/common/Title';
import './style.scss';

export default () => ({
  view(vnode) {
    const { cards, title, subtitle, hx = 'h3', button } = vnode.attrs;
    return <div className="harvestingList">
      {title ? <Title title={title} subtitle={subtitle} hx={hx} button={button}/> : null}
      <hr className="mt-1"/>
      <div className="accordion">
        {cards.map((card, idx) => <CollapsableCard
          title={card.title}
          subTitle={card.date}
          cardId={card.id}
          backgroundType={card.type}
          id ={`harvesting-list-${idx}`}
        >
          {card.body}
        </CollapsableCard>)}
      </div>
    </div>;
  },
});
