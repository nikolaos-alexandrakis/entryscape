# EntryScape Platform

## Installation

### EntryStore
Follow the installation instructions [for EntryStore](http://entrystore.org/#!InstallationEntryStore.md). (Use develop branch.)

### EntryScape (this repository)

Make sure you have npm and bower (npm install bower) installed.

    $> bower install
    $> npm install requirejs
    $> cd merged-nls/
    $> ./merge.sh

You need to configure the URL to the Entrystore installation. You do this in the config file `suiteConfig.js` (both reside in the config directory). You only need to change the line with a comment starting with "CHANGE THIS LINE".

You should now be able to test the application by launching the public.html and edit.html files by appending ?debug=true.
To get it to work without that flag you need to build:

    $> cd ../build
    $> ./build-suite.sh

Note that the config files will be part of the build, hence if you change the config files you need to rebuild.

Note also that the EntryScape web-application should run on the same domain and port as EntryStore unless you activate CORS in EntryStore.