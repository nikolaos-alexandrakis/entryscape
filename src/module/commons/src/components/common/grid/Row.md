# Bootstrap grid Row component

##
```
vnode.attrs
/**
 * @param {Array} columns - An array containing the info about the Boostrap column, e.g 
 * columns = [{size:1, value:'foo'}, {size:10, value:'bar'}, {size:1, value:'baz'}]
 
 * @param {Array} classNames [classNames=[]] - Any class names to be attached to the outer
 * element for the alert, e.g ['class1, 'class2', ...]
 */
```

## Example

```
{
  columns: [{
    size: 1, # col-md-1
    value: 'foo' // can be a component
  }, {
    size: 11, # col-md-11
    value: 'bar'
  }],
  classNames: [] // optional parameter; has to be an array 
}
```

## Outputs
```
<div class="row ${classNames}">
  <div class="col-md-1">foo</div>
  <div class="col-md-11">bar</div>
</div>
```