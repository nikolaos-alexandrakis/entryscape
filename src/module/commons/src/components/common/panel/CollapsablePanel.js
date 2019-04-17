import m from 'mithril';
import './escoPanelComponent.css';

const bemBlock = 'card';
const bemElement = `${bemBlock}__item`;

/**
 * TODO this just a wrapper, not ready to be universally
 * A simple list component based on css grid
 * @see ./Panel.md
 */
export default {
  /**
   * @param {Array} columns - An array containing the list items
   * @param {Array} classNames [classNames=[]] - Class names to be added to the list wrapper, e.g
   * ['class1, 'class2', ...]
   */
  view(vnode) {
    const { type, id, title, date, body } = vnode.attrs.card;
    const panelType = type ? `card-${type}` : '';

    return m(`.card.${cardType}`, { key: id, class: bemElement },
      [
        m(`.card-heading[id="heading-${id}"][role="tab"]`,
          m('h4.card-title',
            // eslint-disable-next-line max-len
            m(`a[aria-controls="collapse-${id}"][aria-expanded="true"][data-parent="#accordion"][data-toggle="collapse"][data-target="#collapse-${id}"][role="button"]`,
              [
                m('i.float-left.fas.fa-fw.fa-chevron-down'),
                m('i.float-left.fas.fa-fw.fa-chevron-right'),
                m('span', title),
                m('span.card__headerDate', date),
              ],
            ),
          ),
        ),
        m(`.card-collapse.collapse.in[aria-labelledby="headingOne"][id="collapse-${id}"][role="tabcard"]`,
          m('.card-body', body),
        ),
      ],
    );
  },
};
