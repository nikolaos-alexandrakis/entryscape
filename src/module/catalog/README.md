# EntryScape Catalog
This is an EntryScape module focused on handling descriptions of datasets in accordance with the [DCAT-AP standard](https://joinup.ec.europa.eu/asset/dcat_application_profile/description).

## Installing
First you must have an Entrystore instance running and also serve EntryScape Catalog from the same host. Alternatively you can activate CORS in the entrystore instance. You can find out more about installing entrystore at [http://entrystore.org](http://entrystore.org). Secondly, you need to make sure you have git, npm and grunt installed. Third, you need to download dependencies and configure EntryScape Catalog:

    npm install
    grunt install
    git submodule init
    git submodule update
    cd config
    cp local.js_example local.js

Finally you need to modify local.js to your needs, e.g. provide the correct path to the entrystore instance.

## Build

    grunt build

## Running
Assuming the install went well you can access EntryScape Catalog at [http://localhost:8080/catalog/?debug=true](http://localhost:8080/catalog/?debug=true)
Here assuming you installed EntryScape Catalog on localhost under the "catalog" path.

If you want to access the built version just omit the `debug=true` parameter.