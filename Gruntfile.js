/*
 * Environment management tasks for Symfony2/Angular workflow
 *
 * This script originated as a port of manage.sh from Bash to Grunt. Feel free
 * to modify it to suit your needs. Config variables are helpfully provided up
 * top to control most common things, and several convenience tasks are defined
 * to allow more fine-grained execution of the various workflow steps.
 */

'use strict';

module.exports = function(grunt) {
  var environments = ['prod', 'stage', 'qa', 'test', 'dev', 'local'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /** Configuration variables */
    bins: {
      behat:    'bin/behat',
      composer: 'composer.phar',
      curl:     'curl',
      git:      'git',
      npm:      'npm',
      php:      'php'
    },
    dirs: {
      assets: {
        src:  '<%= dirs.resources %>/assets',
        dest: '<%= dirs.web %>/assets',
      },
      manage:    'manage',
      resources: 'app/resources',
      stripe:    'manage/stripe',
      web:       'web'
    },
    urls: {
      composer: 'https://getcomposer.org/installer'
    },
    /** -- */

    /** Plugin-specific configuration */
    bower: {
      dev: {
        options: { expand: true },
        dest:    '<%= dirs.assets.src %>/vendor'
      }
    },

    clean: {
      build: {
        src: ['<%= dirs.assets.dest %>/**']
      },
      prod: {
        src: [
          '<%= dirs.web %>/app_*.php',
          '<%= dirs.web %>/config.php',
          '<%= dirs.web %>/check.php'
        ]
      }
    },

    copy: {
      configs: {
        expand: true,
        cwd:    '<%= dirs.manage %>/web/',
        src:    'app_*.php',
        dest:   '<%= dirs.web %>/',
        filter: 'isFile'
      },
      dev: {
        files: [
          {
            expand: true,
            cwd:    '<%= dirs.assets.src %>/',
            src: [
              '**/*.js',
              '**/*.css',
              'fonts/**',
              'img/**',
              '!**/scss/**'
            ],
            dest: '<%= dirs.assets.dest %>'
          }
        ]
      },
      jsOnlyIgnoreVendor: {
        files: [
          {
            expand: true,
            cwd:    '<%= dirs.assets.src %>',
            src: [
              '**/*.js',
              '!**/vendor/**'
            ],
            dest: '<%= dirs.assets.dest %>'
          }
        ]
      }
    },

    sass: {
      build: {
        options: {
          includePaths: [
            '<%= dirs.assets.src %>/vendor/foundation/scss/',
            '<%= dirs.assets.src %>/scss/'
          ],
          sourceMap: true
        },
        files: [
          {
            expand: true,
            cwd:    '<%= dirs.assets.src %>/scss/',
            src:    ['**/*.scss'],
            dest:   '<%= dirs.assets.dest %>/css/',
            ext:    '.css'
          }
        ]
      }
    },

    'sf2-assetic-dump': {
      prod: {
        args: { 'no-debug': true }
      },
      qa: {
        args: { 'no-debug': true }
      },
      stage: {
        args: { 'no-debug': true }
      },
      test: {
        args: { 'no-debug': true }
      },
      dev: {},
      local: {}
    },

    'sf2-assets-install': {
      prod: {
        args: { 'no-debug': true }
      },
      qa: {
        args: { 'no-debug': true }
      },
      stage: {
        args: { 'no-debug': true }
      },
      test: {
        args: { 'no-debug': true }
      },
      dev: {
        args: { 'no-debug': true }
      },
      local: {
        args: { 'no-debug': true }
      }
    },

    'sf2-cache-clear': {
      prod: {
        args: {
          'no-debug':  true,
          'no-warmup': true
        }
      },
      qa: {
        args: {
          'no-debug':  true,
          'no-warmup': true
        }
      },
      stage: {
        args: {
          'no-debug':  true,
          'no-warmup': true
        }
      },
      test: {
        args: {
          'no-debug':  true,
          'no-warmup': true
        }
      },
      dev: {
        args: {
          'no-debug':  true,
          'no-warmup': true
        }
      },
      local: {
        args: {
          'no-debug':  true,
          'no-warmup': true
        }
      }
    },

    'sf2-console': {
      migrate: {
        cmd:  'doctrine:migrations:migrate',
        args: { 'no-interaction': true }
      },
      stripe: {
        cmd: 'stripe:create:plans <%= dirs.stripe %>/plans.csv',
        args: {
          'no-debug':       true,
          'no-interaction': true
        }
      }
    },

    shell: {
      behat: {
        options: { stdout: true },
        command: '<%= bins.behat %>'
      },
      'composer-install': {
        options: { stdout: true },
        command: '<%= bins.php %> <%= bins.composer %> install -o'
      },
      'composer-require': {
        options: {
          stdout:      true,
          stderr:      true,
          failOnError: true
        },
        command: function() {
          if (!grunt.file.exists('./composer.phar')) {
            grunt.log.writeln('Downloading composer.phar...');
            return '<%= bins.curl %> -sS <%= urls.composer %> | <%= bins.php %>';
          }
          grunt.log.write('Found composer.phar; running self-update...');
          return '<%= bins.php %> <%= bins.composer %> self-update -n';
        }
      },
      'composer-update': {
        options: { stdout: true },
        command: '<%= bins.php %> <%= bins.composer %> update -o'
      },
      'git-submodule-init': {
        options: { stdout: true },
        command: '<%= bins.git %> submodule init'
      },
      'git-submodule-update': {
        options: { stdout: true },
        command: '<%= bins.git %> submodule update'
      },
      npm: {
        options: {
          stdout: true,
          stderr: true
        },
        command: '<%= bins.npm %> install'
      }
    },

    watch: {
      scss: {
        options: { interrupt: true },
        files:   '<%= assetSrcDir %>/scss/**/*.scss',
        tasks:   ['copy:assets', 'sass:build']
      }
    }
    /** -- */
  });

  // Load all Grunt tasks
  require('load-grunt-tasks')(grunt);

  // Environment setting from command line
  grunt.config('env', grunt.option('env') || process.env.GRUNT_ENV || 'dev');


  // Ports of manage.sh tasks
  grunt.task.registerTask('behat', 'shell:behat');
  grunt.task.registerTask('composer', ['shell:composer-require', 'shell:composer-install']);
  grunt.task.registerTask('npm', 'shell:npm');
  grunt.task.registerTask('submodules', ['shell:git-submodule-init', 'shell:git-submodule-update']);
  grunt.task.registerTask('configure', function() {
    if (grunt.config('env') === 'prod') {
      grunt.task.run('clean:prod');
    } else {
      grunt.task.run('copy:configs');
    }
  });
  grunt.task.registerTask('vendor', ['composer', 'npm', 'bower']);
  grunt.task.registerTask('migrate', 'sf2-console:migrate');
  grunt.task.registerTask('assets', function() {
    grunt.task.run('copy:assets');
    // Only dump the full asset stack on the "all" option
    if (grunt.config('env') === 'all') {
      environments.forEach(function(env) {
        grunt.task.run('sf2-assetic-dump:' + env);
      });
    } else {
      grunt.task.run('sf2-assetic-dump:' + grunt.config('env'));
    }
  });
  grunt.task.registerTask('cache', function() {
    // Only clear the full cache set on the "all" option
    if (grunt.config('env') === 'all') {
      environments.forEach(function(env) {
        grunt.task.run('sf2-cache-clear:' + env);
      });
    } else {
      grunt.task.run('sf2-cache-clear:' + grunt.config('env'));
    }
  });
  grunt.task.registerTask('plans', 'sf2-console:stripe');
  grunt.task.registerTask('tests', 'behat');

  // Manage.sh behavior
  grunt.task.registerTask('install', [
    'submodules',
    'configure',
    'vendor',
    'migrate',
    'assets',
    'cache',
    'plans',
    'tests'
  ]);

  grunt.task.registerTask('update', [
    'submodules',
    'shell:composer-update',
    'npm',
    'bower',
    'migrate',
    'assets',
    'cache'
  ]);

  // Other tasks
  grunt.task.registerTask('copy:assets', ['clean:build', 'copy:dev']);
  grunt.task.registerTask('dev',         ['copy:assets', 'sass:build', 'watch']);
  grunt.task.registerTask('dev:js',      ['copy:jsOnlyIgnoreVendor']);



  grunt.task.registerTask('default', 'install');

};
