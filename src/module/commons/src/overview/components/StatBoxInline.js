import m from 'mithril';
/**
 *
 * A box with a value and label (used for stats purposes mainly). Eg 25 terms, 2 collections)
 */

export default () => ({
  view(vnode) {
    const { label, value, link, onclick, icon } = vnode.attrs;

    return (
      <a
        class="col-md-6 escoOverview__statBox"
        href={link}
        onclick={onclick}
        tabindex="0"
      >
        <span class={`fa fa-${icon} fa-fw`}
        ></span>
        <p class="escoOverview__statCount">{value}</p>
        <label class="escoOverview__statLabel">{label}</label>
      </a>
    );
  },
});

