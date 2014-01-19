/*
 * grunt-chkpng
 * github.com/yshrsmz/grunt-chkpng
 *
 * Copyright (c) 2014 yshrsmz
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var exec = require('child_process').exec,
        PNG = require('png-js'),
        async = require('async');

    function execute(command, callback) {
        exec(command, function(error, stdout, stderr) {
            callback(stdout);
        });
    };

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks


    grunt.registerMultiTask('chkpng', 'check png image file\'s palette to make sure images are color-reduced.', function () {

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            punctuation: '.',
            separator: ', '
        });

        // Iterate over all specified file groups.
        this.files.forEach(function (file) {
            // Concat specified files.
            var src = file.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                    // Read file source.
                    return grunt.file.read(filepath);
                }).join(grunt.util.normalizelf(options.separator));

            // Handle options.
            src += options.punctuation;

            // Write the destination file.
            grunt.file.write(file.dest, src);

            // Print a success message.
            grunt.log.writeln('File "' + file.dest + '" created.');
        });
    });

    grunt.registerTask('gitchkpng', 'get png files from git commit, then check png image file\'s palette to make sure images are color-reduced.', function() {
        var options = this.options({
            punctuation: '.',
            separator: '\n'
        });

        var done = this.async();

        execute('git diff-index HEAD --name-only', function(str){
            console.log(str);

            var pngFileAry = str.split(options.separator).filter(function(item) {
                var fileType = item.split('.');
                if (fileType.length) {
                    if (fileType[fileType.length - 1].toLowerCase() === 'png') {
                        return true;
                    }
                }
                return false;
            });

            async.each(pngFileAry, function(file, cb) {
                PNG.decode(file, function(pixels) {
                    cb();
                });
            }, function() {
                grunt.log.writeln(JSON.stringify(pngFileAry));
                done();
            });
        });
    });
};
