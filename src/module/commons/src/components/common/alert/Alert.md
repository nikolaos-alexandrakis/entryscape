# Bootstrap Alert component

https://getbootstrap.com/components/#alerts

## Params
```
vnode.attrs
/**
 * @param {String} element - HTML element tag to be used for the alert, e.g div
 * @param {String} type - Boostrap type, e.g success, danger
 * @param {*} text - Text to be displayed
 * @param {*|Array} children - Any other components to be rendered inside the alert
 * @param {Array} classNames [classNames=[]] - Any class names to be attached to the outer
 * element for the alert, e.g ['class1, 'class2', ...]
*/
```

## Example

```
{
   element: 'span',
   type: message ? 'danger' : 'success',
   className: 'pull-right',
   text: message || 'Your teminology was successfully imported.', // nls
   children: null,
}
```

## Outputs
```
<span class="alert alert-success pull-right" role="alert">
  <span>Your teminology was successfully imported.</span>
</span>
```