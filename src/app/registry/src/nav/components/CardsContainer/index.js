import CardItem from './CardItem';
import './style.scss';

export default () => ({
  view(vnode) {
    const { cards = [] } = vnode.attrs;

    return <div className="esreStart__cardsContainer">
      {cards.map(card => <CardItem card={card}/>)}
    </div>;
  },
});
