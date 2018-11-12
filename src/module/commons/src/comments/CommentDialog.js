import TitleDialog from 'commons/dialog/TitleDialog';
import ListDialogMixin from 'commons/list/common/ListDialogMixin';
import escoComment from 'commons/nls/escoComment.nls';

import declare from 'dojo/_base/declare';
import { isFunction } from 'lodash-es';
import Comment from './Comment';
import templateString from './CommentDialogTemplate.html';
import comments from './comments';
import './escoCommentDialog.css';

export default declare([TitleDialog.ContentNLS, ListDialogMixin], {
  bid: 'escoCommentDialog',
  templateString,
  maxWidth: 800,
  nlsBundles: [{ escoComment }],
  nlsHeaderTitle: 'commentHeader',
  nlsFooterButtonLabel: 'commentFooterButton',
  __subjectInput: null,
  __commentInput: null,

  postCreate() {
    this.inherited(arguments);
    this.__commentInput.onkeyup = this.check.bind(this);
  },
  open(params) {
    this.inherited(arguments);
    this.entry = params.row.entry;
    this.row = params.row;
    this._clear();
    this.clearcomments();
    this.listComments();
    this.dialog.show();
  },
  _clear() {
    this.__commentInput.setAttribute('value', '');
    this.__subjectInput.setAttribute('value', '');
  },
  check() {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
      delete this.checkTimer;
    }
    this.checkTimer = setTimeout(() => {
      delete this.checkTimer;
      if (isFunction(this.domNode.checkValidity)) {
        this.domNode.checkValidity();
      }
      this.validateComment();
    }, 300);
  },
  validateComment() {
    if (this.__subjectInput.value.length === 0) {
      this.setStatus(this.__subjectInputStatus, this.NLSBundle0.invalidSubject);
    } else if (this.__commentInput.value.length === 0) {
      this.setStatus(this.__commentInputStatus, this.NLSBundle0.invalidComment);
    } else {
      this.setStatus(this.__subjectInputStatus);
      this.setStatus(this.__commentInputStatus);
    }
  },
  setStatus(node, message) {
    if (message) {
      node.style.display = '';
      node.innerHTML = message; // @scazan: This relies on message being a string
    } else {
      node.style.display = 'none';
    }
  },
  decreaseReplyCount() {
    // Contract with row implementations.
    if (typeof this.row.decreaseReplyCount === 'function') {
      this.row.decreaseReplyCount();
    }
    this.clearcomments();
    this.listComments();
  },
  clearcomments() {
    this.__commentsList.innerHTML = '';
  },
  listComments() {
    const self = this;
    comments.getReplyList(this.entry).forEach((commentEntry) => {
      const commentEntryDiv = document.createElement('div');
      this.__commentsList.appendChild(commentEntryDiv);
      Comment(
        { entry: commentEntry, parent: self, initialOpenReplies: true },
        commentEntryDiv,
      );
    });
  },
  footerButtonAction() {
    const subj = this.__subjectInput.value;
    const comment = this.__commentInput.value;

    if (subj === '') {
      return this.NLSBundle0.invalidSubject;
    }
    if (comment === '') {
      return this.NLSBundle0.invalidComment;
    }

    return comments.createReply(this.entry, subj, comment).then((commentEntry) => {
      this.__commentInput.setAttribute('value', '');
      this.__subjectInput.setAttribute('value', '');
      /* eslint-disable no-new */
      const commentEntryDiv = document.createElement('div');
      this.__commentsList.appendChild(commentEntryDiv);
      new Comment(
        { entry: commentEntry, parent: this },
        commentEntryDiv,
      );
      // update comment count on list of candidates
      this.row.noOfComments = this.row.noOfComments + 1;
      this.row.renderCommentCount();
      return { stopHide: true };
    });
  },
});
