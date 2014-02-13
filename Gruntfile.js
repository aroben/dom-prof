module.exports = function(grunt) {
  grunt.initConfig({
    coffee: {
      all: {
        files: {
          'index.js': 'index.coffee',
          'support.js': 'support.coffee'
        }
      }
    },
    nodeunit: {
      all: ['test.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('default', ['coffee', 'nodeunit']);
};
