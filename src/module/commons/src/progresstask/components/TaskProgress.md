# Task Progress component

A component for displaying a progress list based on tasks and results for those tasks

## Params
```
vnode.attrs
/**
 * @param {Object} tasks - An object containing all tasks and their states. Comprises of two 
 * boostrap components: progress bar (for displaying task states) and list group (for 
 * displaying results for the tasks). 
 * 
 */
```

## Example

```
{
      upload: { // task unique id
        id: 'upload', // task unique id TODO use the object key
        name: 'nlsUploadFile', // nlsString
        width: '33%', // max width / nr of tasks, TODO auto-calculate
        order: 1,
        status: '', // '' | progress | failed | done 
        message: '', // to be shown below the name of task in the results. e.g 25 / 25 concepts 
      },
      analysis: {
        id: 'analysis',
        name: 'nlsSchemeAnalysis',
        width: '33%',
        order: 2,
        status: '',
        message: '',
      },
      import: {
        id: 'import',
        name: 'nlsNumberOfConcepts',
        width: '34%',
        order: 3,
        status: '',
        message: '',
      },
    },
```

## Outputs
In a boostrap modal and when all tasks have successfully completed:
```
<div class="modal-content" data-dojo-attach-point="_modalContent">
  <div class="modal-body" data-dojo-attach-point="_modalBody">
    <div>
      <div>
        <div class="progress">
          <div class="progress-bar bg-success" style="width: 33%;"><span>Upload File</span></div>
          <div class="progress-bar bg-success" style="width: 33%;"><span>Analyse Scheme</span></div>
          <div class="progress-bar bg-success" style="width: 34%;"><span>Import Concepts</span></div>
        </div>
      </div>
      <div>
        <ul class="list-group">
          <li class="list-group-item">
            <div class="row">
              <div class="col-md-1"><i class="fas fa-check" style="font-size: 24px;"></i></div>
              <div class="col-md-11">
                <div class="row ">
                  <div class="col-md-12"><span>Upload File</span></div>
                </div>
              </div>
            </div>
          </li>
          <li class="list-group-item">
            <div class="row">
              <div class="col-md-1"><i class="fas fa-check" style="font-size: 24px;"></i></div>
              <div class="col-md-11">
                <div class="row ">
                  <div class="col-md-12"><span>Analyse Scheme</span></div>
                </div>
              </div>
            </div>
          </li>
          <li class="list-group-item">
            <div class="row">
              <div class="col-md-1"><i class="fas fa-check" style="font-size: 24px;"></i></div>
              <div class="col-md-11">
                <div class="row ">
                  <div class="col-md-12"><span>Import Concepts</span></div>
                </div>
                <div class="row ">
                  <div class="col-md-12"><span style="font-size: 11px;">4 / 4 imported</span></div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div data-dojo-attach-point="_modalFooter">
    <div class="row spaSideDialogFooter">
      <div class="col-md-12"><button class="btn btn-primary float-right"><span>Done</span></button><span class="alert alert-success float-right" role="alert"><span>Your teminology was successfully imported.</span></span></div>
    </div>
  </div>
</div>
```