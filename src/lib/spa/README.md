# Single Page Application (SPA) library

The purpose of this javascript library is to simplify the way you build single page applications.
When you use the SPA library you provide a configuration which defines the single page application as a site with
a range of views.

## The site configuration
The site configuration is a JavaScript structure where each view is defined. 
Consider the following simple configuration which is a simplication of the config in ```test/test.js```:
```
const siteConf = {
  baseUrl: 'https://example.com/',
  startView: 'admin',
  modules: {
      admin: {
        productName: 'Admin',
        faClass: 'cogs',
        restrictTo: 'admin',
        startView: 'admin__users',
        sidebar: true,
      },
  views: [
    {
      name: 'admin',
      class: 'entryscape-commons/nav/Cards',
      title: {en: 'Administration', sv: 'Administration', de: 'Administration'},
      route: '/admin',
      module: 'admin',
      sidebar: false,
    },
    {
      name: 'admin__users',
      class: 'entryscape-admin/users/List',
      faClass: 'user',
      title: {en: 'Users', sv: 'Användare', de: 'Benutzer'},
      route: '/admin/users',
      parent: 'admin',
      module: 'admin',
    },
  ],
  },
};
```
As you see in this example each view has a name, a class to instantiate for this view, and potentially some constructor parameters.
For more information on how to configure SPA you can see the test cases under the ```test``` directory. 

## Run the tests on the browser

In order to evaluate the test on a browser environment (note that SPA works only on a browser environment) you will need to build
the library first. 

```
yarn 
yarn build
```

After you have build you can access the test cases on your local server under http://localhost/test/any_of_the_test_files.html
These test files server also as examples on the usage of the library.
