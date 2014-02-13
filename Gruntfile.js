module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        quotmark: true,
        undef: true,
        unused: true,
        trailing: true,
        boss: true,
        eqnull: true,
        browser: true,
        node: true,
        phantom: true
      },
      grunt: {
        src: ['Gruntfile.js'],
        options: {
          node: true
        }
      },
      src: {
        src: ['cli.js', 'runner.js']
      },
      test: {
        src: ['test/test.js']
      }
    },
    coffee: {
      all: {
        files: {
          'index.js': 'index.coffee',
          'support.js': 'support.coffee'
        }
      }
    },
    nodeunit: {
      all: ['test/test.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('default', ['coffee', 'jshint', 'nodeunit']);
};
