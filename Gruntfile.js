module.exports = function(grunt) {
    grunt.task.loadTasks('node_modules/metasolutions-grunt/tasks');

    grunt.config.merge({
        nls: {
            langs: ["en", "sv", "da"],
            depRepositories: ["entryscape-commons", "entryscape-admin", "entryscape-catalog", "entryscape-terms", "entryscape-workbench"]
        },
        update: {
            libs: [
                'di18n',
                'spa',
                'rdfjson',
                'rdforms',
                'store',
                'entryscape-commons',
                'entryscape-admin',
                'entryscape-catalog',
                'entryscape-terms',
                'entryscape-workbench'
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-available-tasks');

};