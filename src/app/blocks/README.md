# EntryScape Blocks 
Allows you to embed information from EntryScape in various websites or CMS:es

## 1. Principles
EntryScape Blocks consists of a set of UI-components that can be inserted into a web page to enrich it with information fetched from the EntryScape backend (EntryStore).

To include a block in a webpage two things needs to be done:

1. An element needs to be marked to trigger a certain block which often includes providing some parameters.
2. The blocks javascript must be included in the webpage to detect all marked elements and render the corresponding blocks.

## 2. Example markup with attributes

Lets look at a small but complete example where we render the title of entry 1 from context 1 from the entrystore instance at http://example.com/store. We will see three different ways to provide
 parameters to a block:

### Option 1: Multiple attributes (Recommended approach)
This is the preferred option for describing a block if the amount of parameters and their values are reasonable small.

    <span data-entryscape="text" 
          data-entryscape-entry="1"
          data-entryscape-context="1"
          data-entryscape-entrystore="http://example.com/store"></span>

### Option 2: Single attribute as JSON (Useful for plugins / integrations)
This option is more compact, but it can be complicated to get all the quotes right. The value has to be correct json.

    <span data-entryscape='{"block": "text", "entry": "1", "context": "1", "entrystore": "http://example.com/store"}'></span>


### Option 3: Attributes in JSON as special script tag (used for many parameters and large values)

    <script type="text/x-entryscape-json">
      {
         "block": "text",
         "entry": "1",
         "context": "1",
         "entrystore": "http://example.com/store"
      }
    </script>

## 3. All blocks works with entries
At the core of EntryStore is the concept of an entry. An entry consists of information (metadata)describing some entity (a resource). The entity may be a person, a webpage, an uploaded file etc.

All blocks needs to be told which entries to work with or as in the case of lists and 
searchLists how to search for entries.

### Hardcode the entry
Sometimes you know in advance which entry to present, for instance you want to write a text 
around a certain entity and lift out certain properties in different parts of the text without 
hardcoding them in the text. For instance:

    <p>In stockholm the population has grown substantially the last 50 years and is now estimated to
     be <span data-entryscape="text" data-entryscape-context="2" data-entryscape-entry="34"
     data-entryscape-content="${dbpo:populationSize"></span>.</p>

### Entry from page parameters
A common scenario is to have one webpage for searching and one webpage to see the details for each search result. In this case you cannot hardcode the entry as a parameter to the block, instead it has to be detected from page parameters. Insert page parameters like this:

    https://example.com/detailspage#esc_entry=1&esc_context=1

If you want to change to another expression you can specify this in the global `__entryscape_config` variable like this (to avoid potential conflicts):

     __entryscape_config = {
        //  This is the default value
        hashParamsPrefix: "esc_"
     };

### Entry from search result inside of lists
Blocks used within rowHead or rowExpand templates will be instantiated with the entry of each
 search result.

### Entries one step away - using relation and inverseRelation (advanced)
Sometimes blocks needs to retrieve entries related to the entry provided by the page parameter. For example, a page may want to display information about both an organization and the related site (via org:hasSite property) it is located at. Many of the blocks support the relation and inverseRelation parameters to indicate the property to follow from the current entry, e.g.:

    Organization: <span data-entryscape='{"block": "text"}'></span><br>
    At site: <span data-entryscape='{"block": "text", relation: "org:hasSite"}'></span>
 
### Avoiding loading the same entry twice - define and use (advanced)
Fetching a related entry nearly always requires a request to entrystore to be made and will cause a small delay. If multiple blocks wants to present information about a single related entry it is clearly unnecessary to request the same entry multiple times. The define and use mechanism lets you avoid this problem by allowing one block be the main responsible for requesting an entry and then "define" it when it is loaded.
The blocks that have stated they want to "use" an entry will get rendered first when it is available. Lets continue with the example above but now you want to have the name of the site in a h3 element and the rest of the metadata below.

    Site <h3><span data-entryscape='{"block": "text", "relation": "org:hasSite", "define": "site"}'></span></h3>
    <p data-entryscape='{"block": "viewMetadata", "rdformsid": "org:Site" "use": "site"}'></span>

## 4. Avaliable blocks

### text
Can be used without any parameter, if so it tries to find a suitable title for the current entry. This behaviour can be overridden by providing the `content` parameter where anything looking like `${ns:prop}` will be replaced with the corresponding value of the property (if it exists):

    <span data-entryscape="text" data-entryscape-content="${vc:firstName} ${vc:lastName}"></span>

### link
The link block produces the same text as the text block but makes it into a link by using the `click` parameter. E.g.

    <span data-entryscape="link" data-entryscape-click="/otherpage"></span>

The link to the "/otherpage" will have the page parameters appended (see section on page parameters above) for the entry relevant for the link block.

### template
This block allows you to write handlebar templates which may contain HTML, data-driven control flow as well as additional blocks and nested templates. E.g.: 

    Given name: {{prop foaf:firstName}}<br>
    {{ifprop foaf:givenName}}Family name: {{prop foaf:familyName}}{{/ifprop}}
    <hr>
    {{viewMetadata rdformsid="rdformsTemplateIdForFoaf"}}

Learn more about the handlebar templates supported in section 5 on templates below.

### image
Renders an image by finding a URL from a specified property given in the parameter `property`. It also sets the size from the parameters `width` and `height`, e.g.:

    <span data-entryscape="image"
          data-entryscape-property="foaf:depiction"
          data-entryscape-width="300px"></span>

### viewMetadata
Renders metadata of an entry with help of an RDForms template given by the parameter `rdformsid` 
(to avoid confusion with handlebar templates). E.g.:

    <span data-entryscape="viewMetadata"
          data-entryscape-rdformsid="dcat:OnlyDataset"
          data-entryscape-filterpredicates="dcterms:title,dcterms:description"
          data-entryscape-onecol="true"></span>

To avoid constructing a lot of templates it is possible to exclude certain fields from the template via the parameter `filterpredicates`. This is very useful when you want to have special treatment of certain fields, e.g. have the dcterms:title in the title and not in the complete metadata view.

Do not forget that you must load appropriate RDForms bundles with the templates you need, see 
section 6 and 7 on how to configure with the correct bundles.

With the onecol argument set to true, fieldnames will be one row and the value beneth. The alternative (and default) is to have the first level fields on the same row as the fieldname to make the rendering more vertically compact.

### list
Renders a list of entries given a query. The following example lists all persons in a certain 
context and will use the default label it can find using well known label properties (in this 
case using a combination of foaf:givenName and foaf:familyName to render each result). The amount
 of results are capped to 8, if there are more matching results there will be pagination.

    <span data-entryscape="list"
          data-entryscape-context="1"
          data-entryscape-limit="8"
          data-entryscape-rdftype="foaf:Person"></span>

If an entry is given to the list, (e.g. via a page parameter, see section 3 for other options) it
 is possible to trigger a search based on that entry by following a relation. The 
 following example shows all people that a given person claim to know:
 
    <span data-entryscape="list"
          data-entryscape-relation="foaf:knows"></span>
 
Or alternatively the people that claims to know the given person:
 
    <span data-entryscape="list"
          data-entryscape-relationinverse="foaf:knows" ></span>

We can make each row in the list clickable by providing a `data-entryscape-click="someotherpage
.html"` just like how it was done for the `link` block.

We can see the details of a row (entry) in the list by providing a rdforms 
template in the `rdformsid` parameter. This will make each row expandable and use the `viewMetadata`
 block to render it on expand.
 
    <span data-entryscape="list"
          data-entryscape-rdftype="foaf:Person"
          data-entryscape-rdformsid="rdformsTemplateIdForFoaf"
          data-entryscape-expand-tooltip="More information"
          data-entryscape-unexpand-tooltip="Less information"></span>

To provide custom rendering of the list the following templates can be defined:

* listplaceholder - shown if the list is empty
* listhead - shown if the list is not empty at the top
* listbody - wrapper template for the rows, use the {{body}} directive to indicate where the list rows should go  
* rowhead - rendered for each list result.
* rowexpand - rendered on expand for each row, if provided there will be an expand button at the 
end of each row.

Read section 5 for more details on handlebar templates and how to provide multiple templates in a
 nice way.

Care has to be taken when writing rowhead templates to avoid causing too many requests, e.g. if you 
need to load additional entries per row. The following example shows how to render a list of 
 documents with their creators and publisher visible directly in a clever way using the parameter 
 dependencyproperties.
 
    <script type="text/x-entryscape-json">
      {
        "block": "searchList",
        "dependencyproperties": "dcterms:creator,dcterms:publisher",
        "limit": "8",
        "templates": {
          "rowhead": "<h4>{{text}}</h4><br>Creator: {{text relation=\"dcterms:creator\"}} Publisher: {{text relation=\"dcterms:publisher\"}}"
         }
      }
    </script> 

The dependencyproperty causes the list to look through all the retrieved entries, follow the 
indicated properties and load all those related entries in one request before trying to render 
the list. It is best to use dependencyproperties together with a rather conservative limit, otherwise we may end up with to large queries (100 search results with no overlapping dependencies would in this scenario cause a query of 200 entries).


### searchList
Similar to the `list` block, but what is shown in the list can change based on user interactions.
The search can be controlled by a plain search field at the top of the list or by a 
combination of other blocks that control a search filter, those blocks are `searchInput`, 
`facets`, `searchFilter` and `multiSearch`. The first case looks similar as for the `list` block:

    <span data-entryscape="searchList"
          data-entryscape-rdftype="foaf:Person"></span>

The only difference being that there is now an input field at the top of the list where users can
 search for persons by name.
 
In the other, and more interesting, case the searchList is used in headless mode, i.e. without its 
own search input. For example, below it is used together with the `multiSearch` block:

    <span data-entryscape="multiSearch"></span>
    <span data-entryscape="searchList"
          data-entryscape-headless="true"></span>

If the search filter makes use of facets (see the following block definitions), the following 
parameter has to be provided to make sure facets are loaded on search.

    data-entryscape-facets="true"

### simpleSearch
Provides a detached search field for a searchList (must be in headless mode) that can be positioned 
anywhere on the page. With the plainInput parameter there is no serch icon to the right of the 
input field. 

    <span data-entryscape="simpleSearch"
          data-entryscape-plaininput="true"
          data-entryscape-placehoder="Search for..."></span>

It is possible to force the simpleSearch block to search against a certain property. This is
 achieved by referring to a collection that provides the definition of that property, i.e. the 
 property and weather it is a literal or a uri. 

    <span data-entryscape="simpleSearch"
          data-entryscape-collection="familyname"></span>

The simpleSearch does not provide a dropdown with search suggestions like the `searchFilter` 
does, however it does search automatically on keypress with a small delay.

### searchFilter

### facets
### multiSearch  

### map
### chart

### config
This block provides configuration options that have no direct visual rendering but provides configurations that are used by one or several other blocks, see section below the different 
ways of providing configuration.

## 5. Providing handlebar templates
Handlebar templates are used in the `list`, `searchList` and the `template` blocks.

### Small templates
Small templates can be provided inline, e.g. the `template` block expects a htemplate parameter 
and it can look like this:

    <span data-entryscape="template"
          data-entryscape-htemplate="{{prop dcat:theme render=\"label\"}}"></span>

### Large templates
Larger templates are easier to provide in special script tag of type `text/x-entryscape-handlebar`, this also avoids the awkward escaping of quotes. For this kind of scripts the block will be assumed to be `template` unless something else is specified.

    <script type="text/x-entryscape-handlebar">
        {{prop dcat:theme render="label"}}
    </script>

### Conditionals using ifprop
Conditional check via `ifprop` is true if a certain property exists, e.g.:

    {{ifprop foaf:firstName}}
      {{prop foaf:firstName}} {{prop foaf:lastName}}
    {{/ifprop}}

It is possible to check for a certain value of the property, here a literal:
 
    {{ifprop foaf:name literal="John"}}
       This is John, he is a special person.
     {{/ifprop}}

As well as invert the check, here not matching a specific uri:

    {{ifprop rdf:type uri="foaf:Person" invert="true"}}
      This is Not a person.
    {{/ifprop}}
 
### Loops using eachprop
Loop that goes through values for a certain property, e.g.:

    {{#eachprop "dcat:theme"}}<span class="tema">{{label}}</span>{{/eachprop}}

Within the loop a few special directives are available:

* value - the value of the property
* type - the type of the value (uri, literal or blank)
* language - the language code for the value (if any)
* datatype - the datatype of the value (if any)
* label - a nice label for the value (first tries to find one from loaded RDForms templates and then from loaded entries)
* description - a description from a matching choice in a loaded RDForms template (if any)
* regexp - the result of applying the regular expression provided as parameter to eachprop
* md5 - an md5 sum of the value

### Accessing data using prop
Renders the value given a property.

    {{prop "foaf:name"}}

The parameter `render` may be given with a value corresponding to the available directives for `eachProp` except regexp which is provided via its own parameter. Here is an example of the use of render twice, both for a nice label as well as for setting a specific css class based on the value:

    <span class='theme_{{prop "dcat:theme" render="md5"}}'>{{prop "dcat:theme" 
    render="label"}}</span>
    
And here is an example of a regexp that picks out the year from a date:

    {{prop "dcterms:date regexp="^\\d*"}}

### Blocks in templates
Note that all EntryScape blocks are made available as helpers within the handlebar template. That means that it is possible to have blocks inside of blocks.

    {{ifprop foaf:firstName}}
      {{text content="${foaf:firstName} ${foaf:lastName"}}
    {{/ifprop}}

Note, this example provides the same result to the example above (in Large templates section). 
Hence, it can be argued that the content parameter of the text block is superflous as the same 
thing can be achieved with the prop directive inside of template blocks. This is true, but the text block is more convenient and less complex in many cases, it was also implemented first and it is
 a question on being backwards compatible.

### Blocks with multiple templates
For the `list` and `searchList` block up to 4 different handlebar templates may be provided.
There are two options for providing these templates:

#### Using the templates parameter
In this case it is best to rely option 3 for providing parameters, i.e. script with json:

    <script type="text/x-entryscape-json">
      {
        "block": "searchList",
        "templates": {
          "listplaceholder": "<h4>No matching results</h4>",
          "rowhead": "<h4>{{text}}</h4><div class="description">{{text content="${dcterms:description}"}}</div>"
         }
      }
    </script>

#### Encoding multiple templates inside of a single template
There are situations when using json is not an option, e.g. when the templates have to be 
provided inside of another template. (Strictly speaking it is possible, but the amount of 
escaping for correct formating makes it complicated and error prone.)

For this purpose there is a special solution that relies on encoding the templates using the 'raw' 
blocks mechanism in handlebars. A raw block is achieved by using four curly brances, in the 
example below you see the listplaceholder and rowhead templates provided in this way.

    <script type="text/x-entryscape-handlebar">
      {{ifprop rdf:type uri="dcterms:Collection"}}
        {{list relation="dcterms:hasPart"}}
          {{{{listplaceholder}}}}
            <h4>No matching results</h4>
          {{{{/listplaceholder}}}}
          {{{{rowhead}}}}
            <h4>{{text}}</h4>
            <div class="description">{{text content="${dcterms:description}"}}</div>
          {{{{/rowhead}}}}
        {{/list}}
      {{/ifprop}}
    </script>
    
Note: in the example above the justification for having the list within a template is a conditional check, but it can just as well be something else such as a need to have lists within lists.

## 6. How to provide configuration
Some information is used by serveral blocks and is therefore more suitable to provide in a configuration section. For instance, it is only possible communicate with one entrystore instance per page this, hence it is a prime candidate to define in a configuration section. Lets take this as an example and see two ways to provide the configuration.

### Configuration as a global variable in javascript

    <script>
      __entryscape_config = {
        entrystore: {
          repository: "http://localhost:8080/store/"
        }
      };
    </script>

Note 1, this script has to be inserted before the main EntryScape Blocks script.

Note 2, the global `__entryscape_config` variable is the same as provided in the config/local
.js which is included in the build. Hence, it is possible to build a special version of EntryScape Blocks with certain parameters hardcoded, for instance which entrystore instance to connect to.

### Configuration using the specific config block

    <span data-entryscape="config" 
          data-entryscape-entrystore="http://example.com/store"></span>

Note that we if we have more complicated configuration it is more suitable to use option 2 
or 3 as specified above.

## 7. Configuration options
Below we list the available configuration options.

### entrystore

Which entrystore instance to connect to, examplified above.

### context

Restricts all blocks (unless overridden) to make all requests in the entrystore instance within 
the specified context. An individual context may be given or an array of multiple contexts.
A context is indicated via its context id, in most cases this is a number provided as a string.
  
### namespaces
This is an object that provides a map from the abbreviation to the full namespace. This map will be registered and centrally and will help you write the rest of the configurations. For example:

    "namespaces": {
        "ex": "http://example.com/"
    }
  
Observe that a bunch of common namespaces are already registered like: *rdf*, *rdfs*, *dc*, *dcterms*, *foaf*, *skos*, *dcat*, *xsd*, *ical*, *vcard*, *owl*, *wot*, *org*, *vs*, *gn*, *schema*.
You can look them up using [prefix.cc](http://prefix.cc).
    
### bundles
In addition to the RDForms template bundles provided by default in blocks (includes support for dcat, dcterms, foaf) you can indicate additional template bundles to be loaded like this:
  
    "bundles": [
       "https://example.com/my/template/bundle.js"
    ],

### collections
  
Collections are used to populate the `facet`, `multiSearch` and `searchFilter` blocks. There are five ways to provide collections as indicated by the `type` attribute:

1. **inline** - an array of objects with label and value in the `list` attribute.
2. **rdforms** - reuse "choices" from RDForms template choice items as they already provides label and values. Reuse by providing item id in the `templatesource` attribute.
3. **preload** - preload collection from entrystore, this is done by providing the constraining attributes `rdftype` and an optional `context`.
4. **search** - an solr search will be performed to yield a collection of the matching entries, typically by combining a given `rdftype` attribute with a generic search term, for instance from typeahead input field.
5. **facet** - the latest solr search performed by the search block (with the facet flag) will yield a collection from the facets in the results. The `property` attribute is mandatory to indicate the facet and an `nodetype` must be specified to be `literal` if the facet values are not to be treated as URIs which is the default.
  
### entitytypes and type2template
  
When using rdforms to show metadata it is sometimes neccessary to provide an indication which form to use for related entities in the form. Therefore you can provide a map between type of the entity and which RDForms template to use, like this:
  
    "type2template": {
        "foaf:Agent": "idOfTemplateForAgent"
    }
  
In some situations you need more complicated ways of matching entities to templates, e.g. when a simple type is not unique enough. In the following example both countries and continents are represented as gn:FeatureCode, but we can make the distinction based on the gn:featureCode property instead. For the country we need to capture a range of different featureCodes since they all correspond to countries in different legal states, this is done by providing an array for the property, it is interpreted as a disjunction when searching. Since the simple map form cannot be used we use the entitytypes attribute instead like this:
  
    "entitytypes" : {
      "country": {
        constraints: {
          "rdf:type": "gn:Feature",
          "gn:featureCode": [
             "gn:A.PCLD", "gn:A.PCLI","gn:A.PCLIX", "gn:A.PCLH", 
             "gn:A.TERR", "gn:A.PCLS", "gn:A.PCLF", "gn:A.PCL"]
        },
        template: "countryTemplateId",
      },
      "continent": {
        constraints: {
          "rdf:type": "gn:Feature",
          "gn:featureCode": ["gn:L.CONT"]
        },
        template: "continentTemplateId",
      },
    }   



## 8. Wordpress plugin
With the help of the wordpress plugin it is possible to provide blocks using the shortcode syntax which will be translated to the original expressions described above. For example, the following shortcode:

    [entryscape block="text" content="${vc:firstName} ${vc:lastName}"]

Translates to the example given in documentation of the text block above, repeated here for clarity and ease of comparision:

    <span data-entryscape='{"block": "text", "content"="${vc:firstName} ${vc:lastName}"}'></span>

For the blocks that requires expressing handlebar templates we also need a closing shortcode:

    [entryscape block="template"]
      <h4>{{text}}</h4>
      <div class="description">{{text content="${dcterms:description}"}}</div>
    [/entryscape]

Which corresponds to the example taken in the section introducing handlebar templates, again repeated here for clarity and ease of comparision:

    <script type="text/x-entryscape-handlebar" data-entryscape='{"block": "template"}'>
      <h4>{{text}}</h4>
      <div class="description">{{text content="${dcterms:description}"}}</div>
    </script>

For more information about the wordpress plugin, see the documentation in the plugins/wordpress folder.