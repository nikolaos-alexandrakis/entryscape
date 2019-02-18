import TaskProgress from 'commons/progresstask/components/TaskProgress';
import m from 'mithril';

const getObjectValues = x => Object.keys(x).reduce((y, z) => y.push(x[z]) && y, []);

/**
 * Update a certain progress dialog with given tasks
 *
 * @param {ProgressDialog} progressDialog
 * @param {object} tasks
 * @param {function} [showFooterResult=null]
 * @param {boolean} [updateFooter=false]
 * @param {string} [errorMessage='']
 */
export const updateProgressDialog = (progressDialog, tasks, {
  showFooterResult = null,
  updateFooter = false,
  errorMessage = '',
} = {}) => {
  const modalBody = progressDialog.getModalBody();
  m.render(modalBody, m(TaskProgress, { tasks: getObjectValues(tasks) }));

  if (updateFooter) {
    showFooterResult(errorMessage);
  }
};

