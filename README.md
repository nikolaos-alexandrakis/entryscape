# EntryScape Platform

First you must have an Entrystore instance running and also serve EntryScape Suite from the same host. Alternatively you can activate CORS in the entrystore instance. You can find out more about installing entrystore at [http://entrystore.org](http://entrystore.org). Secondly, you need to make sure you have git, npm and grunt installed. Third, you need to download dependencies and configure EntryScape Suite:

    npm install
    grunt install
    cd config
    cp local.js_example local.js

Finally, you need to provide a local configuration, see the examples in `config/local.js_example_basic` and `config/local.js_example_options`.

As a minimum you need to make sure the `repository` key points to a working EntryStore installation.

You should now be able to run EntryScape Suite by pointing your browser to the `index.html` file. Note that you can debug by appending `?debug`. (Debugging only works if you have installed all dependencies, this is done in the build step, but you can do it explicitly via `grunt install`.

Note also that the EntryScape web-application should run on the same domain and port as EntryStore unless you activate CORS in EntryStore.