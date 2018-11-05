import template from './ToggleRowTemplate.html';
import EntryRow from '../EntryRow';
import registry from '../../registry';

import declare from 'dojo/_base/declare';

export default declare([EntryRow], {
  templateString: template,
  nlsPublicTitle: '',
  nlsProtectedTitle: '',
  showCol1: true,
  /**
   * Needs to be set in postCreate to correspond to correct value
   */
  isPublicToggle: false,
  /**
   * Weather it is allowed to toggle this row to public or not.
   */
  allowTogglePublic: true,

  setToggled(isEnabled, isPublic) {
    this.toggleEnabled = isEnabled;
    if (isEnabled) {
      this.publicToggleNode.classList.remove('disabled');
      this.isPublicToggle = isPublic;
      if (isPublic) {
        this.publicNode.style.display = '';
        this.protectedNode.style.display = 'none';
      } else {
        this.publicNode.style.display = 'none';
        this.protectedNode.style.display = '';
      }
    }
  },

  updateLocaleStrings(generic, specific) {
    this.inherited('updateLocaleStrings', arguments);
    this.publicNode.setAttribute('title', specific[this.nlsPublicTitle]);
    this.protectedNode.setAttribute('title', specific[this.nlsProtectedTitle]);
  },

  toggle(ev) {
    if (!this.toggleEnabled) {
      return;
    }
    ev.stopPropagation();
    if (this.allowToggle() === false) {
      return;
    }
    this.toggleImpl(
      this.setToggled.bind(this, true, !this.isPublicToggle)
    );
  },

  allowToggle() {
    return true;
  },
});
