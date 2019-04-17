import declare from 'dojo/_base/declare';
import jquery from 'jquery';
import EntryRow from '../list/EntryRow';

const rights = [
  'none',
  'read',
  'write',
  'admin',
  'rread',
  'rwrite',
  'mread',
  'mwrite',
  'mwrite_rread',
  'rwrite_mread',
];

const rrights = [
  'none',
  'rread',
  'rwrite',
  'admin',
];

const rmap = {
  read: 'rread',
  write: 'rwrite',
  mwrite_rread: 'rread',
  rwrite_mread: 'rwrite',
};

export default declare([EntryRow], {
  showCol1: true,

  postCreate() {
    this.inherited(arguments);

    if (this.list.isContextsACL || this.list.isPrincipalsACL) {
      this.focusOnResource = true;
    }
    this.domNode.classList.add('principalRow');
    if (this.list.readOnly) {
      this.domNode.classList.add('readOnly');
    }
  },

  installButtonOrNot(params) {
    const id = this.entry.getId();
    if (params.name === 'remove') {
      if (id === '_guest' || id === '_users') {
        return false;
      }
      return !this.list.readOnly;
    }
    return this.inherited(arguments);
  },

  updateLocaleStrings() {
    this.inherited('updateLocaleStrings', arguments);
  },

  getNLSLabel(keyParam) {
    let key = keyParam;
    if (this.list.isContextsACL) {
      key += 'ContextsOption';
    } else if (this.list.isPrincipalsACL) {
      key += 'PrincipalsOption';
    } else if (this.list.isContextACL) {
      key += 'ContextOption';
    } else {
      key += 'Option';
    }
    return (this.nlsSpecificBundle && this.nlsSpecificBundle[key]) || this.nlsGenericBundle[key] || '';
  },
  getNLSTitle(keyParam) {
    let key = keyParam;
    if (this.list.isContextsACL) {
      key += 'ContextsOptionTitle';
    } else if (this.list.isPrincipalsACL) {
      key += 'PrincipalsOptionTitle';
    } else if (this.list.isContextACL) {
      key += 'ContextOptionTitle';
    } else {
      key += 'OptionTitle';
    }

    return (this.nlsSpecificBundle && this.nlsSpecificBundle[key]) || this.nlsGenericBundle[key] || '';
  },

  renderCol1() {
    if (this.entry.isUser()) {
      this.col1Node.innerHTML = '<i class="fas fa-user fa-lg"></i>';
    } else {
      this.col1Node.innerHTML = '<i class="fas fa-users fa-lg"></i>';
    }
  },

  getRenderName() {
    if (this.nlsSpecificBundle) {
      if (this.entry.getId() === '_guest') {
        return this.nlsSpecificBundle.guestLabel;
      } else if (this.entry.getId() === '_users') {
        return this.nlsSpecificBundle.usersLabel;
      }
    }
    return this.inherited(arguments);
  },

  renderCol3() {
    this.col3Node.innerHTML = '';

    if (this.nlsGenericBundle) { // Localization strings are loaded.
      const list = this.list;
      const entryId = this.entry.getId();
      const wrapperNode = document.createElement('span');
      wrapperNode.classList.add('dropdown', 'float-right');
      this.col3Node.appendChild(wrapperNode);

      let currentRight = list.getRight(entryId);
      if (this.focusOnResource && rmap.hasOwnProperty(currentRight)) {
        currentRight = rmap[currentRight];
      }
      const simpleRight = currentRight === 'none' || currentRight === 'read'
        || currentRight === 'write' || currentRight === 'admin';
      const currentRightLabel = this.getNLSLabel(currentRight);
      const currentRightTitle = this.getNLSTitle(currentRight);
      const textNode = document.createElement('span');
      textNode.classList.add('principalRight');
      textNode.setAttribute('data-toggle', 'dropdown');
      wrapperNode.appendChild(textNode);

      const currentRightNode = document.createElement('span');
      currentRightNode.innerHTML = currentRightLabel;
      currentRightNode.setAttribute('title', currentRightTitle);
      textNode.appendChild(currentRightNode);

      if (this.list.readOnly) {
        return;
      }
      const newSpan = document.createElement('span');
      newSpan.classList.add('caret');
      textNode.appendChild(newSpan);

      const ul = document.createElement('ul');
      ul.classList.add('dropdown-menu', 'dropdown-menu-right');
      wrapperNode.appendChild(ul);

      let selectedLi;
      const options = this.focusOnResource ? rrights : rights;
      options.forEach((right, i) => {
        let li;
        const label = this.getNLSLabel(right);
        const title = this.getNLSTitle(right);
        const labelA = `<a>${label}</a>`;

        if (i > 3) {
          li = document.createElement('li');
          li.innerHTML = labelA;
          li.classList.add('extraRights', 'selectable');
          li.setAttribute('title', title);
          ul.appendChild(li);
        } else {
          li = document.createElement('li');
          li.innerHTML = labelA;
          li.classList.add('selectable');
          li.setAttribute('title', title);
          ul.appendChild(li);
        }
        li.onclick = () => {
          if (selectedLi) {
            selectedLi.classList.remove('disabled');
            selectedLi.classList.add('selectable');
          }
          li.classList.add('disabled');
          li.classList.remove('selectable');
          selectedLi = li;
          currentRightNode.innerHTML = label;
          list.setRight(entryId, right);
        };
        if (right === currentRight) {
          li.classList.add('disabled');
          li.classList.remove('selectable');
          selectedLi = li;
        }

        if (right === 'admin' && !this.focusOnResource) {
          const newLi = document.createElement('li');
          newLi.setAttribute('role', 'separator');
          newLi.classList.add('divider');
          ul.appendChild(newLi);

          const moreLabel = `<a>${(this.nlsSpecificBundle && this.nlsSpecificBundle.moreOptions)
          || this.nlsGenericBundle.moreOptions || ''}</a>`;

          const moreLabelTitle =
            (this.nlsSpecificBundle && this.nlsSpecificBundle.moreOptionsTitle)
            || this.nlsGenericBundle.moreOptionsTitle || '';

          const more = document.createElement('li');
          more.classList.add('moreOptions', 'selectable');
          more.innerHTML = moreLabel;
          more.setAttribute('title', moreLabelTitle);
          ul.appendChild(more);

          more.onclick = (ev) => {
            wrapperNode.classList.remove('simpleRight');
            ev.stopPropagation();
          };
        }
      });
      if (simpleRight) {
        wrapperNode.classList.add('simpleRight');
      }

      jquery(ul).dropdown();
    }
  },
});
