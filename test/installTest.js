var plugin = require('../index.js'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    Vinyl = require('vinyl'),
    mavenDeploy = require('maven-deploy');

/* globals describe: false, it: false, beforeEach: false, afterEach: false */

describe('gulp-maven-deploy plugin', function () {

    var fileA, fileB;

    beforeEach(function () {
        sinon.stub(mavenDeploy, 'config');
        sinon.stub(mavenDeploy, 'install');
        mavenDeploy.install.yields(null);

        fileA = new Vinyl({
            cwd: "/home/jdoe/gulp-maven-deploy/",
            base: "/home/jdoe/gulp-maven-deploy/test",
            path: "/home/jdoe/gulp-maven-deploy/test/fileA.txt",
            contents: new Buffer('some content of file A')
        });

        fileB = new Vinyl({
            cwd: "/home/jdoe/gulp-maven-deploy/",
            base: "/home/jdoe/gulp-maven-deploy/test",
            path: "/home/jdoe/gulp-maven-deploy/test/fileB.txt",
            contents: new Buffer('some content of file B')
        });
    });

    afterEach(function () {
        mavenDeploy.config.restore();
        mavenDeploy.install.restore();
    });

    describe('install method', function () {

        it('is a function', function () {
            expect(plugin).to.have.property('install').that.is.a('function');
        });

        it('passes processed config to maven-deploy module', function (done) {
            var expectedConfig = {
                'finalName': 'myName.war',
                'groupId': 'com.mygroup',
                'type': 'war'
            };

            var stream = plugin.install(expectedConfig);

            stream.on('finish', function() {
                expect(mavenDeploy.config).to.be.calledWith(expectedConfig);
                done();
            });

            stream.write(fileA);
            stream.end();
        });

        it('calls install function of maven-deploy for each piped file', function (done) {
            var stream = plugin.install({});

            stream.on('finish', function() {
                expect(mavenDeploy.install).to.be.calledTwice;
                done();
            });

            stream.write(fileA);
            stream.write(fileB);
            stream.end();
        });

        it('triggers error event if deploy fails', function(done) {
            var expectedError = 'An error occured',
                stream = plugin.install({});

            // Call install callback with no error
            mavenDeploy.install.yields(expectedError);

            stream.on('error', function(error) {
                expect(error).to.be.equal(expectedError);
                done();
            });

            stream.write(fileA);
            stream.end();
        });
    });
});
