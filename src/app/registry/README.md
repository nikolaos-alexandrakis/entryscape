# EntryScape registry

EntryScape Registry provides an overview of datasets harvested from various DCAT enabled sources. There are support for self registration, statistics and visualizations. A simple search and browse user interface is provided to be see the imported datasets and which catalogs they belong to.

In addition there is a toolkit targeted towards developers that provides support for testing catalogs according to a validation profile, merging catalogs, exploring uploaded datasets as well as converting from older versions of DCAT, i.e. mapping deprecated values to newer when possible.

EntryScape Registry depends on [EntryStore](http://entrystore.org) for storing information as well as the [Pipelines](https://bitbucket.org/metasolutions/entryscape-pipelines) script library for running harvesting jobs.

#Installation

    npm install
    grunt build
    
To install EntryStore and Pipelines, see separate documentation.