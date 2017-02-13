# EntryScape Platform

## Installation

### EntryStore
Follow the installation instructions [for EntryStore](http://entrystore.org/#!InstallationEntryStore.md). (Use develop branch.)

### EntryScape (this repository)

Make sure you have npm installed.

    $> npm install
    $> grunt build

Furthermore, you need to provide a local configuration, see the examples in `config/local.js_example_basic` and `config/local.js_example_options`.

As a minimum you need to make sure the `repository` key points to a working EntryStore installation.

You should now be able to run EntryScape Suite by pointing your browser to the `index.html` file. Note that you can debug by appending `?debug=true`. (Debugging only works if you have installed all dependencies, this is done in the build step, but you can do it explicitly via `grunt install`.

Note also that the EntryScape web-application should run on the same domain and port as EntryStore unless you activate CORS in EntryStore.