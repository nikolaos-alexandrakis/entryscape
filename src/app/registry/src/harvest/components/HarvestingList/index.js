import CollapsableCard from 'commons/components/bootstrap/Collapse/Card';
import Title from 'commons/components/common/Title';

/**
 * TODO this just a wrapper, not ready to be universally
 * A simple list component based on css grid
 * @see ./PanelGroup.md
 */
export default () => {
  return {
    view(vnode) {
      console.log(vnode.attrs.cards[0]);
      const { cards, title, subtitle, hx = 'h3', button } = vnode.attrs;
      return <div>
        {title ? <Title title={title} subtitle={subtitle} hx={hx} button={button}/> : null}
        <hr style="margin: 10px auto"/>
        <div>{cards.map((card, idx) => <CollapsableCard card={card} id={`harvesting-list-${idx}`}/>)}</div>
      </div>;
    },
  };
};
