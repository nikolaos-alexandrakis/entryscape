import config from 'config';
import { utils } from 'rdforms';
import { i18n } from 'esi18n';
import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import escoProgress from 'commons/nls/escoProgress.nls';

import TitleDialog from '../dialog/TitleDialog';
import template from './ProgressDialogTemplate.html';
import DOMUtil from '../util/htmlUtil';
import ListDialogMixin from '../list/common/ListDialogMixin';
import './escoProgress.css';

export default declare([TitleDialog.ContentNLS, _WidgetsInTemplateMixin, ListDialogMixin], {
  bid: 'escoProgress',
  templateString: template,
  maxWidth: 800,
  nlsBundles: [{ escoProgress }],
  nlsHeaderTitle: 'progressHeader',
  nlsFooterButtonLabel: 'progressFooterButton',
  __progressNode: null,
  __checkboxNode: null,

  postCreate() {
    this.inherited(arguments);
    this.getTaskNames();
    this.createProgress();
    this.createCheckBoxes();
  },
  open(params) {
    this.inherited(arguments);
    this.row = params.row;
    this.entry = params.row.entry;
    this.displayProgressBar();
    this.dialog.show();
  },
  displayProgressBar() {
    const self = this;
    const metadataTasks = [];
    this.noOfCompletedMandatoryTasks = 0;
    // var metadata = self.entry.getMetadata();
    const infoEntryGraph = self.entry.getEntryInfo().getGraph();
    // var tasks = metadata.find(self.entry.getResourceURI(), "http://entrystore.org/terms/progress");
    const tasks = infoEntryGraph.find(self.entry.getResourceURI(), 'http://entrystore.org/terms/progress');
    tasks.forEach((task) => {
      metadataTasks.push(task.getObject().value);
    });
    this.configuredTasks.forEach((configuredTask) => {
      if (metadataTasks.indexOf(configuredTask.name) !== -1) {
        if (configuredTask.mandatory) {
          this.noOfCompletedMandatoryTasks += 1;
        }
        self.setProgressBar(configuredTask.name, self.taskWidth, configuredTask.mandatory);
        self.setCheckBoxes(configuredTask.name, true);
      } else {
        self.setProgressBar(configuredTask.name, 0, configuredTask.mandatory);
        self.setCheckBoxes(configuredTask.name, false);
      }
    });
  },
  updateProgress(selectedName, isMandatory, event) {
    const target = event.target || event.srcElement;
    if (target.checked) {
      if (isMandatory) {
        this.noOfCompletedMandatoryTasks += 1;
      }
      this.setProgressBar(selectedName, this.taskWidth, isMandatory);
    } else {
      if (isMandatory) {
        this.noOfCompletedMandatoryTasks -= 1;
      }
      this.setProgressBar(selectedName, 0, isMandatory);
    }
  },
  getTaskNames() {
    this.configuredTasks = [];
    this.manadatoryTasks = [];
    const self = this;
    if (config.catalog && config.catalog.checklist) {
      const tasks = config.catalog.checklist;
      tasks.forEach((task) => {
        if (task.mandatory) {
          self.manadatoryTasks.push({
            name: task.name,
            label: utils.getLocalizedValue(task.label).value,
            shortLabel: utils.getLocalizedValue(task.shortLabel).value,
            description: utils.getLocalizedValue(task.description).value,
            mandatory: task.mandatory,
          });
        }
        self.configuredTasks.push({
          name: task.name,
          label: utils.getLocalizedValue(task.label).value,
          shortLabel: utils.getLocalizedValue(task.shortLabel).value,
          description: utils.getLocalizedValue(task.description).value,
          mandatory: task.mandatory,
        });
      });
    }
  },
  createProgress() {
    const self = this;
    this.tasks = [];
    this.taskWidth = 100 / this.configuredTasks.length;
    this.configuredTasks.forEach((configuredTask) => {
      const div = DOMUtil.create('div', null, self.__progressNode);
      DOMUtil.addClass(div, 'progress-bar bg-warning escoProgress__taskIndicator escoProgress__progressBar');
      div.setAttribute('width', `${self.taskWidth}%`);
      div.innerHTML = configuredTask.shortLabel;
      self.tasks.push({
        taskEl: div,
        taskName: configuredTask.name,
        taskLabel: configuredTask.label,
        taskShortLabel: configuredTask.shortLabel,
      });
    });
  },
  createCheckBoxes() {
    this.taskCheckBoxes = [];
    this.configuredTasks.forEach((configuredTask) => {
      const divCard = DOMUtil.create('div', null, this.__checkboxNode);
      DOMUtil.addClass(divCard, 'card escoProgress__task');
      const heading = DOMUtil.create('div', null, divCard);
      DOMUtil.addClass(heading, 'checkbox card-heading escoProgress__taskHeading');

      const label = DOMUtil.create('label', null, heading);
      const input = DOMUtil.create('input', { type: 'checkbox' }, label);
      const task = DOMUtil.create('span', null, label);
      task.innerHTML = configuredTask.label;
      DOMUtil.addClass(task, 'escoProgress__taskLabel');

      if (configuredTask.description) {
        const newDiv = DOMUtil.create('div', null, divCard);
        DOMUtil.addClass(newDiv, 'card-body escoProgress__taskDescription');
        newDiv.innerHTML = configuredTask.description;
      }
      if (configuredTask.mandatory) {
        const mandatoryIndicator = DOMUtil.create('i', null, heading);
        DOMUtil.addClass(mandatoryIndicator, 'float-right fas fa-exclamation-circle escoProgress__mandatorytask');
        this.taskCheckBoxes.push({
          taskEl: input,
          taskNameEl: task,
          taskName: configuredTask.name,
          mandatory: mandatoryIndicator,
        });
      } else {
        this.taskCheckBoxes.push({
          taskEl: input,
          taskNameEl: task,
          taskName: configuredTask.name,
        });
      }
      const updateProgress = this.updateProgress.bind(this, configuredTask.name, configuredTask.mandatory);

      input.onclick = updateProgress;
    });
  },
  setProgressBar(selectedName, taskWidth) {
    this.tasks.forEach((task) => {
      // task is object
      if (task.taskName === selectedName) {
        const div = task.taskEl;
        div.style.width = `${taskWidth}%`;
        div.innerHTML = task.taskShortLabel;
        div.setAttribute('title', task.taskLabel);
        if (taskWidth === 0) {
          div.innerHTML = '';
        }
      }
    });
    this.tasks.forEach((task) => {
      const div = task.taskEl;
      /* eslint-disable max-len */
      if (this.noOfCompletedMandatoryTasks === this.manadatoryTasks.length) {
        DOMUtil.removeClass(div, 'progress-bar bg-warning escoProgress__taskIndicator escoProgress__progressBar');
        DOMUtil.addClass(div, 'progress-bar bg-success escoProgress__taskIndicator escoProgress__progressBar');
      } else {
        DOMUtil.removeClass(div, 'progress-bar bg-success escoProgress__taskIndicator escoProgress__progressBar');
        DOMUtil.addClass(div, 'progress-bar bg-warning escoProgress__taskIndicator escoProgress__progressBar');
      }
      /* eslint-enable max-len */
    });
  },
  setCheckBoxes(taskName, isChecked) {
    const { mandatoryChecklistTitle } = i18n.getLocalization(escoProgress);
    this.taskCheckBoxes.forEach((taskCB) => {
      // task is object
      if (taskCB.taskName === taskName) {
        const input = taskCB.taskEl;
        if (isChecked) {
          input.checked = true;
        } else {
          input.checked = false;
        }
      }
      if (taskCB.mandatory) {
        const mandatoryIndicator = taskCB.mandatory;
        mandatoryIndicator.setAttribute('title', mandatoryChecklistTitle);
      }
    });
  },
  footerButtonAction() {
    const infoEntryGraph = this.entry.getEntryInfo().getGraph();
    const tasksCheckBoxes = this.taskCheckBoxes;
    tasksCheckBoxes.forEach((taskCB) => {
      const input = taskCB.taskEl;
      if (input.checked) {
        infoEntryGraph.addL(this.entry.getResourceURI(), 'http://entrystore.org/terms/progress', taskCB.taskName);
      } else {
        infoEntryGraph.findAndRemove(this.entry.getResourceURI(), 'http://entrystore.org/terms/progress', {
          type: 'literal',
          value: taskCB.taskName,
        });
      }
    });
    return this.entry.getEntryInfo().commit()
      .then(this.list.rowMetadataUpdated.bind(this.list, this.row));
  },
});
