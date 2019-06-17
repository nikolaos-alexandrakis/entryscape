export default {
  getPopoverOptions() {
    return {
      html: true,
      placement: 'left',
      template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-body"></div></div>',
      trigger: 'hover',
      container: 'body',
    };
  },
};
