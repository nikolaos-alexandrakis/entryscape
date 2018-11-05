module.exports = (grunt) => {
  grunt.task.loadTasks('node_modules/entryscape-js/tasks');

  grunt.config.merge({
    nls: {
      langs: ['en', 'sv', 'de'],
      depRepositories: ['entryscape-commons', 'entryscape-catalog'],
    },
    update: {
      libs: [
        'di18n',
        'spa',
        'rdfjson',
        'rdforms',
        'store',
        'entryscape-commons',
        'entryscape-catalog',
      ],
    },
    less: {
      bootstrap: {
        files: {
          'release/bootstrap.css': 'bootstrap.css'
        }
      }
    },
    copy: {
      bootstrap: {
        files: [
          {src: ['node_modules/bootstrap/dist/js/bootstrap.js'], dest: 'release/bootstrap.js', filter: 'isFile'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-available-tasks');
};
