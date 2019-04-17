# Bootstrap Button component

https://getbootstrap.com/css/#buttons

## Params
```
vnode.attrs
/**
 * @param {String} element - HTML element tag to be used for the button, e.g button
 * @param {String} type - Boostrap type, e.g success, danger
 * @param {*} text - Value to be displayed
 * @param {Function} onclick - Event function to be called when an click event occurs
  is clicked
 * @param {Array} classNames [classNames=[]] - Any class names to be attached to the outer
 * element for the alert, e.g ['class1, 'class2', ...]
*/
```

## Example

```
{
  element: 'button',
  type: message ? 'default' : 'primary',
  classNames: ['float-right'],
  text: message ? 'Cancel' : 'Done', // nls
  onclick: this.progressDialog.hide.bind(this.progressDialog),
}
```

## Outputs
```
<button class="btn btn-primary float-right"><span>Done</span></button>
```