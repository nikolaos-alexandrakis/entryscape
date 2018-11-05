import template from './SideDialogTemplate.html';
import DOMUtil from '../util/htmlUtil';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import './dialog.css';

const mobileMaxWidth = 415;
let level = 0;
let maxWidth = 0;
let maxWidthOwner = null;
let busy = false;

const SideDialog = declare([_WidgetBase, _TemplatedMixin], {
  templateString: template,
  indent: 25,
  firstIndent: 75,
  maxWidth: 0,
  _isHidden: true,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.underlay.onclick = () => {
      if (!busy) {
        this.conditionalHide();
      }
    };
  },
  show() {
    this._isHidden = false;
    if (this._addedToDom !== true) {
      document.querySelector('#entryscapeDialogs').appendChild(this.domNode);
      this._addedToDom = true;
    }
    const box = {
      w: document.documentElement.clientWidth,
      h: document.documentElement.clientWidth,
    };
    const indent = (this.indent * level) + this.firstIndent;
    level += 1;
    let end;
    let dialogWidth;
    if (maxWidth === 0 && this.maxWidth > 0 && this.maxWidth < box.w - this.indent) {
      maxWidth = this.maxWidth + this.indent;
      maxWidthOwner = this;
    }

    if (maxWidth > 0) {
      end = box.w - (maxWidth - indent);
      dialogWidth = maxWidth - indent;
    } else if (box.w < mobileMaxWidth) {
      end = 0;
      dialogWidth = box.w;
    } else {
      end = indent;
      dialogWidth = box.w - indent;
    }
    this.domNode.style.display = 'block';
    this.domNode.style.zIndex = `${1031 + level}`;
    this.domNode.style.opacity = 0;

    jquery(this.dialogContent).css({
      left: box.w + 'px',
      right: -dialogWidth + 'px',
    })
      .animate({
        left: end + 'px',
        right: 0 + 'px',
      });

    jquery(this.domNode).fadeTo(400, 1);
  },
  isHidden() {
    return this._isHidden;
  },
  conditionalHide() {
    this.hide();
  },
  hide() {
    if (level <= 0) { // Avoid to many hide calls
      const err = new Error();
      console.warn(`Too many hide calls to sideDialog, check the code.\n${err.stack}`);
      return;
    }
    busy = true;
    level -= 1;
    const box = {
      w: document.documentElement.clientWidth,
      h: document.documentElement.clientWidth,
    };
    const indent = (this.indent * level) + this.firstIndent;
    let start;
    let dialogWidth;
    if (maxWidth > 0) {
      start = box.w - (maxWidth - indent);
      dialogWidth = maxWidth - indent;
    } else {
      start = indent;
      dialogWidth = box.w - indent;
    }

    jquery(this.dialogContent).css({
      left: start + 'px',
      right: 0 + 'px',
    })
      .animate({
        left: box.w + 'px',
        right: -dialogWidth + 'px',
      });

    jquery(this.domNode).fadeOut(function () {
      this.domNode.style.display = 'none';
      this._isHidden = true;
      busy = false;
      this.hideComplete();
    }.bind(this));

    if (this === maxWidthOwner) {
      maxWidth = 0;
      maxWidthOwner = null;
    }
  },
  hideComplete() {
  },
});

SideDialog.createParams = function (from, attrs) {
  const obj = {};
  for (let i = 0; i < attrs.length; i++) {
    const p = attrs[i];
    if (typeof from[p] !== 'undefined') {
      obj[p] = from[p];
    }
  }
  return obj;
};

SideDialog.Content = declare([_WidgetBase, _TemplatedMixin], {
  templateString: '<h1>Override me!</h1>',

  buildRendering() {
    const dialogNode = this.srcNodeRef || DOMUtil.create('div');
    this.dialog = new SideDialog(SideDialog.createParams(this,
      ['indent', 'firstIndent', 'maxWidth']), dialogNode);
    this.srcNodeRef = DOMUtil.create('div', null, this.dialog.containerNode);
    this.inherited(arguments);
  },
});

export default SideDialog;
