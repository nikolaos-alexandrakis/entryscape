import {i18n, NLSMixin} from 'esi18n';
import escoComment from 'commons/nls/escoComment.nls';
import {template as renderTemplate} from 'lodash-es';
import templateString from './CommentTemplate.html';
import registry from '../registry';
import comments from './comments';
import dateUtil from '../util/dateUtil';
import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import focusUtil from 'dijit/focus'; // TODO
import './escoComment.css';

// @TODO: @scazan Figure out and update NLS parts of this
const CommentCls = declare([_WidgetBase, _TemplatedMixin, NLSMixin.Dijit], {
  bid: 'escoComment',
  templateString,
  __subject: null,
  __replies: null,
  __replyIcon: null,
  __commentInput: null,
  __commentEditButtons: null,
  __commentEditSave: null,
  __commentEditCancel: null,
  __userInfo: null,
  __dateInfo: null,
  __commentDisplay: null,
  __commentEditNode: null,
  __editComment: null,
  __commentReply: null,
  __commentsList: null,
  initialOpenReplies: false,

  nlsBundles: [{escoComment}],
  nlsSpecificBundle: escoComment,

  postCreate() {
    this.renderComments();
    if (this.isReply) {
      this.domNode.classList.add(`${this.bid}--reply`);
    }
    this.inherited('postCreate', arguments);
  },
  localeChange() {
    this.updateLocaleStrings();
  },
  updateLocaleStrings() {
    if (this.NLSBundle0) {
      this.creationDateTitle = this.NLSBundle0.creationDateTitle;

      const tStr = renderTemplate(this.creationDateTitle)({date: this.cDateFull});

      this.__dateInfo.setAttribute('title', tStr);
      if (this.noOfReplies > 0) {
        this.__replies.style.display = '';
        this.__replyIcon.style.display = '';
        this.__replies.innerHTML = i18n.renderNLSTemplate(this.NLSBundle0.reply, this.noOfReplies);
      } else {
        this.__replies.style.display = 'none';
        this.__replyIcon.style.display = 'none';
        this.__editComment.setAttribute('disabled', false);
      }
    }
  },
  renderComments() {
    let commentTxt = comments.getCommentText(this.entry);
    const subjectTxt = comments.getCommentSubject(this.entry);
    this.__commentInput.innerHTML = commentTxt;
    commentTxt = commentTxt.replace(/(\r\n|\r|\n)/g, '<br/>');
    this.__commentDisplay.innerHTML = commentTxt;
    this.__subject.innerHTML = subjectTxt;
    const self = this;
    const es = registry.get('entrystore');
    const userResourceUri = this.entry.getEntryInfo().getCreator();
    es.getEntry(es.getEntryURIFromURI(userResourceUri)).then((userEntry) => {
      const user = registry.get('rdfutils').getLabel(userEntry);
      self.__userInfo.innerHTML = user;
      self.__userInfo.setAttribute('title', 'User');
    });
    const cDate = this.entry.getEntryInfo().getCreationDate();
    const mDateFormats = dateUtil.getMultipleDateFormats(cDate);
    this.cDateFull = mDateFormats.full;
    this.__dateInfo.innerHTML = mDateFormats.short;
    this.updateRepliesCount();
    if (this.initialOpenReplies && this.noOfReplies > 0) {
      this.toggleReplies();
    }
  },
  updateRepliesCount() {
    // Assuming comment resourceURI is repository local
    this.noOfReplies = comments.getNrOfReplies(this.entry);
    if (this.noOfReplies <= 0) {
      // enable edit
      this.__editComment.setAttribute('disabled', false);
    }
    this.updateLocaleStrings();
  },
  toggleReplies() {
    this.__repliesArr = [];
    if (this.__commentsList.style.display === 'none') {
      this.__replyIcon.classList.remove('fa-caret-right');
      this.__replyIcon.classList.add('fa-caret-down');
      this.__commentsList.style.display = '';
      this.__commentsList.innerHTML = '';
      const self = this;
      comments.getReplyList(this.entry).forEach((commentEntry) => {
        const newDiv = document.createElement('div');
        self.__commentsList.appendChild(newDiv);
        this.__repliesArr.push(new CommentCls({
            entry: commentEntry,
            parent: self,
            isReply: true
          },
          newDiv,
        ));
      });
    } else {
      this.__replyIcon.classList.remove('fa-caret-down');
      this.__replyIcon.classList.add('fa-caret-right');
      this.closeReplies();
    }
  },
  deleteComment() {
    const dialogs = registry.get('dialogs');
    const confirmMessage = i18n.renderNLSTemplate(this.NLSBundle0.removeComment, this.noOfReplies);
    dialogs.confirm(confirmMessage, null, null, (confirm) => {
      if (confirm) {
        comments.deleteCommentAndReplies(this.entry)
          .then(this.parent.decreaseReplyCount.bind(this.parent));
      }
    });
  },
  decreaseReplyCount() {
    this.noOfReplies -= 1;
    this.clearcomments();
    this.listComments();
  },
  editComment() {
    // enable editing and save
    this.__commentDisplay.style.display = 'none';
    this.__commentEditNode.style.display = '';
    this.__commentInput.setAttribute('disabled', false);
    this.__commentEditButtons.style.display = '';
    focusUtil.focus(this.__commentInput);
  },
  editSave() {
    const self = this;
    let commentTxt = self.__commentInput.value;
    const metadata = self.entry.getMetadata();
    const stmt = metadata.find(null, 'oa:hasBody')[0];
    metadata.findAndRemove(null, 'rdf:value');
    metadata.addL(stmt.getValue(), 'rdf:value', commentTxt);
    // var cstmt = metadata.find(null, "cnt:chars")[0];
    // cstmt.setValue(commentTxt);
    self.entry.commitMetadata().then((newCommentEntry) => {
      self.entry = newCommentEntry;
      commentTxt = commentTxt.replace(/(\r\n|\r|\n)/g, '</br>');
      self.__commentDisplay.innerHTML = commentTxt;
      self.__commentDisplay.style.display = '';
      self.__commentInput.setAttribute('disabled', true);
      self.__commentEditButtons.style.display = 'none';
      self.__commentEditNode.style.display = 'none';
    });
  },
  editCancel() {
    this.__commentDisplay.style.display = '';
    this.__commentEditNode.style.display = 'none';
    this.__commentInput.setAttribute('disabled', true);
    this.__commentEditButtons.style.display = 'none';
  },
  replyComment() {
    this.__commentReply.style.display = '';
    const subjectTxt = `Re: ${this.entry.getMetadata().findFirstValue(null, 'dcterms:title')}`;
    this.subjectNode.setAttribute('value', subjectTxt);
    focusUtil.focus(this.commentNode);// ESCO-41 fix
  },
  postReply() {
    const self = this;
    const commentTxt = self.commentNode.value;
    const subjectTxt = self.subjectNode.value;
    comments.createReply(this.entry, subjectTxt, commentTxt)
      .then((commentEntry) => {
        self.commentNode.setAttribute('value', '');
        self.noOfReplies += 1;
        self.updateLocaleStrings();
        self.cancelReply();
        self.__replyIcon.classList.remove('fa-caret-right');
        self.__replyIcon.classList.add('fa-caret-down');
        self.__commentsList.style.display = '';
        self.__editComment.setAttribute('disabled', true);
        // self.closeReplies();
        if (this.__repliesArr == null) {
          this.__repliesArr = [];
        }
        this.__repliesArr.push(new CommentCls({entry: commentEntry, parent: self}));
        const newDiv = document.createElement('div');
        self.__commentsList.insertBefore(newDiv, self.__commentsList.firstChild);
      });
  },
  cancelReply() {
    this.__commentReply.style.display = 'none';
    this.commentNode.innerHTML = '';
    this.subjectNode.innerHTML = '';
  },
  closeReplies() {
    this.__commentsList.style.display = 'none';
    this.__commentsList.innerHTML = '';
  },
  clearcomments() {
    this.__commentsList.innerHTML = '';
  },
  listComments() {
    this.__commentsList.style.display = 'none';
    this.toggleReplies();
    this.updateLocaleStrings();
  },
});

export default CommentCls;