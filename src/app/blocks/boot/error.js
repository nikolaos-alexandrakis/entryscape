define([
    'dojo/on',
], (on) => {
    return function (node, data) {
        node.innerHTML = 'Blocks error, click to see details.';
        node.setAttribute('title', data.error);
        node.classList.add('entryscape-boot-error');
        on(node, "click", () => {
            alert(data.error + "\n" + data.errorCause);
        });
    };
});