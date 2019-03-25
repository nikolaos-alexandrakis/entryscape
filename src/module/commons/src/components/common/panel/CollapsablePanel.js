import m from 'mithril';
import './escoPanelComponent.css';

const bemBlock = 'panel';
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
    const { type, id, title, date, body } = vnode.attrs.panel;
    const panelType = type ? `panel-${type}` : '';

    return m(`.panel.${panelType}`, { key: id, class: bemElement },
      [
        m(`.panel-heading[id="heading-${id}"][role="tab"]`,
          m('h4.panel-title',
            // eslint-disable-next-line max-len
            m(`a[aria-controls="collapse-${id}"][aria-expanded="true"][data-parent="#accordion"][data-toggle="collapse"][data-target="#collapse-${id}"][role="button"]`,
              [
                m('i.pull-left.fa.fa-fw.fa-chevron-down'),
                m('i.pull-left.fa.fa-fw.fa-chevron-up'),
                m('span', title),
                m('span.panel__headerDate', date),
              ],
            ),
          ),
        ),
        m(`.panel-collapse.collapse.in[aria-labelledby="headingOne"][id="collapse-${id}"][role="tabpanel"]`,
          m('.panel-body', body),
        ),
      ],
    );
  },
};
