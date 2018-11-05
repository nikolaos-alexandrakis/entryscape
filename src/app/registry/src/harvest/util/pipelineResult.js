import {terms} from 'store';

const getStatusAndColor = (entry) => {
  switch (entry.getEntryInfo().getStatus()) {
    case terms.status.InProgress:
      return {
        status: terms.status.InProgress,
        color: 'LightSkyBlue',
        fa: 'spinner',
        bootstrap: 'info',

      };
    case terms.status.Pending:
      return {
        status: terms.status.Pending,
        color: 'orange',
        fa: 'pause-circle',
        bootstrap: 'warning',

      };
    case terms.status.Succeeded:
      return {
        status: terms.status.Succeeded,
        color: 'green',
        fa: 'check-circle',
        bootstrap: 'success',
      };
    case terms.status.Failed:
    default:
      break;
  }

  return {
    status: terms.status.Failed, color: 'red', fa: 'error', bootstrap: 'danger',
  };
};

/**
 * Get a status from a pipeline result and set a respective color to a statusNode
 * @param {store/Entry} entry
 * @param statusNode
 */
const renderStatus = (entry, statusNode) => {
  const {fa, bootstrap} = getStatusAndColor(entry);
  statusNode.classList.add(`text-${bootstrap}`, `fa-${fa}`);
};

export {
  renderStatus,
  getStatusAndColor
};

export default {
  renderStatus,
  getStatusAndColor
};
