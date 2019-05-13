# EntryScape tools - A set of tools to work with RDF more directly.

## Installation

### EntryStore
Follow the installation instructions [for EntryStore](http://entrystore.org/#!InstallationEntryStore.md). (Use develop branch.)

### EntryScape terms (this repository)

Make sure you have npm installed. Then:

    $> npm install
    $> grunt build

You need to configure the URL to the EntryStore installation in the `local.js` file. If the file does not exist, then create it. See `local.js_example`.

You should now be able to test the application by launching the index.html. If you want to debug append ?debug=true.
To get it to work without that flag you need to build:

Note that the config files will be part of the build, hence if you change the config files you need to rebuild.

Note also that the EntryScape web-application should run on the same domain and port as EntryStore unless you activate CORS in EntryStore.