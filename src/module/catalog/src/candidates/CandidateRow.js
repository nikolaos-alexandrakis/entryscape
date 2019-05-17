import registry from 'commons/registry';
import EntryRow from 'commons/list/EntryRow';
import comments from 'commons/comments/comments';
import { i18n } from 'esi18n';
import config from 'config';
import declare from 'dojo/_base/declare';
import template from './CandidateRowTemplate.html';
import './escaCandidateRow.css';

export default declare([EntryRow], {
  bid: 'escaCandidateRow',
  templateString: template,
  includeInfoButton: false,
  includeEditButton: true,
  includeRemoveButton: true,
  showCol1: true,

  postCreate() {
    this.inherited('postCreate', arguments);
    this.candidateEntry = this.entry;
    this.renderCol4();
  },
  updateLocaleStrings() {
    this.inherited('updateLocaleStrings', arguments);
    this.maybeUpdate();
  },
  render() {
    this.inherited(arguments);
    this.maybeUpdate();
  },
  renderCol1() {
    if (config.catalog && config.catalog.checklist) {
      const checklistSteps = config.catalog.checklist;
      const completedChecklistSteps = [];
      const mandatoryChecklistSteps = [];
      const infoEntryGraph = this.candidateEntry.getEntryInfo().getGraph();
      const tasks = infoEntryGraph.find(this.candidateEntry.getResourceURI(), 'http://entrystore.org/terms/progress');
      tasks.forEach((task) => {
        completedChecklistSteps.push(task.getObject().value);
      });
      this.noOfTasksCompleted = completedChecklistSteps.length;
      this.noOfCheckListSteps = checklistSteps.length;
      let progress = Math.round((this.noOfTasksCompleted * 100) / checklistSteps.length);
      if (progress > 0) {
        progress -= 2;
      }

      checklistSteps.forEach((checklistStep) => {
        if (checklistStep.mandatory) {
          mandatoryChecklistSteps.push({
            name: checklistStep.name,
          });
        }
      });
      let isMandatoryCheckslistCompleted = true;
      let mandatory = mandatoryChecklistSteps.length;
      mandatoryChecklistSteps.forEach((mandatoryChecklistStep) => {
        if (completedChecklistSteps.indexOf(mandatoryChecklistStep.name) === -1) {
          isMandatoryCheckslistCompleted = false;
          mandatory -= 1;
        }
      });
      this.noOfMandatoryCompleted = mandatory;
      this.noOfMandatory = mandatoryChecklistSteps.length;
      this.__progressBar.classList = '';
      this.__progressBar.classList.add('escaCandidateRow__progressBar'); // IE11 doesn't allow multiple params in classList.add();
      if (isMandatoryCheckslistCompleted) {
        this.__progressBar.classList.remove('escaCandidateRow__progressBar--incomplete');
        this.__progressBar.classList.add('escaCandidateRow__progressBar--ready');
      } else {
        this.__progressBar.classList.add('escaCandidateRow__progressBar--incomplete');
      }

      this.__progressBar.style.setProperty('border-left-width', `${progress}px`);
    }
  },
  renderCol4() {
    // badgeNode
    comments.getNrOfComments(this.entry).then((nr) => {
      this.noOfComments = nr;
      if (nr > 0) {
        this.badgeNode.style.display = '';
        this.badgeNode.innerHTML = nr;
        this.maybeUpdate();
      }
    });
  },
  decreaseReplyCount() {
    this.noOfComments -= 1;
    this.renderCommentCount();
  },
  renderCommentCount() {
    // badgeNode
    if (this.noOfComments > 0) {
      this.badgeNode.display = '';
      this.badgeNode.innerHTML = this.noOfComments;
    } else {
      this.badgeNode.style.display = 'none';
    }
    this.maybeUpdate();
  },
  maybeUpdate() {
    if (this.nlsSpecificBundle) {
      if (this.noOfComments > 0) {
        const tStr = i18n.renderNLSTemplate(this.nlsSpecificBundle.commentTitle, this.noOfComments);
        this.badgeNode.setAttribute('title', tStr);
      }
      this.__progressBarOuter.setAttribute('title', i18n.renderNLSTemplate(this.nlsSpecificBundle.progressBarTitle, {
        checked: this.noOfTasksCompleted,
        total: this.noOfCheckListSteps,
        mandatory: this.noOfMandatoryCompleted,
        totalMandatory: this.noOfMandatory,
      }));
    }
  },
  openCommentDialog(ev) {
    this.list.openDialog('comment', { row: this });
    ev.stopPropagation();
  },
  action_remove() {
    const dialogs = registry.get('dialogs');
    const self = this;
    let confirmMessage;
    if (this.noOfComments > 0) {
      confirmMessage = i18n.renderNLSTemplate(
        this.nlsSpecificBundle.removeCdatasetAndComments,
        this.noOfComments,
      );
    } else {
      confirmMessage = this.nlsSpecificBundle.removeCdataset;
    }

    dialogs.confirm(confirmMessage, null, null, (confirm) => {
      if (!confirm) {
        return null;
      }
      return comments.getReplyList(this.entry)
        .forEach(comment => comment.del()).then(() => self.entry.del().then(() => {
          self.list.getView().removeRow(self);
          self.destroy();
        }), () => {
          self.renderCommentCount();
          dialogs.acknowledge(self.nlsSpecificBundle.failedToRemoveCDatasetComments);
        });
    });
  },
});
