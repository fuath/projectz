/* @flow */
'use strict'

// Import
const projectzUtil = require('./lib/projectz-util')
const { spawn } = require('safeps')
const { suite } = require('kava')
const { join } = require('path')
const { readdir, readFile } = require('safefs')
const { equal } = require('assert-helpers')

// -------------------------------------
// Configuration

// Paths
const projectzPath = join(__dirname, '..')
const srcPath = join(projectzPath, 'test-fixtures', 'src')
const expectPath = join(projectzPath, 'test-fixtures', 'out-expected')
const cliPath = join(projectzPath, 'bin.js')

// -------------------------------------
// Tests

suite('projectz unit tests', function(suite, test) {
	suite('getGithubSlug', function(suite, test) {
		test('short repo', function() {
			equal(
				projectzUtil.getGithubSlug({ repository: 'bevry/projectz' }),
				'bevry/projectz'
			)
		})
		test('gist failure', function() {
			equal(
				projectzUtil.getGithubSlug({ repository: 'gist:11081aaa281' }),
				null
			)
		})
		test('bitbucket failure', function() {
			equal(
				projectzUtil.getGithubSlug({ repository: 'bitbucket:bb/repo' }),
				null
			)
		})
		test('gitlab failure', function() {
			equal(projectzUtil.getGithubSlug({ repository: 'gitlab:gl/repo' }), null)
		})
		test('full repo', function() {
			equal(
				projectzUtil.getGithubSlug({
					repository: { url: 'https://github.com/bevry/projectz' }
				}),
				'bevry/projectz'
			)
		})
		test('full repo with .git', function() {
			equal(
				projectzUtil.getGithubSlug({
					repository: { url: 'https://github.com/bevry/projectz.git' }
				}),
				'bevry/projectz'
			)
		})
	})
})

suite('projectz integration tests', function(suite, test) {
	// Compile with Projectz using -p to switch to the source path.
	test('compile project with projectz', function(done) {
		const command = ['node', cliPath, 'compile', '-p', srcPath]
		spawn(command, { stdio: 'inherit' }, done)
	})

	// Check that the compiled files match correctly.
	suite('check result files', function(suite, test, done) {
		readdir(expectPath, function(err, files) {
			if (err) return done(err)
			files.forEach(function(file) {
				// Create a test for the file
				test(file, function(done) {
					// Load the expected source.
					readFile(join(expectPath, file), 'utf8', function(err, expected) {
						if (err) return done(err)

						// Load the actual source.
						readFile(join(srcPath, file), 'utf8', function(err, actual) {
							if (err) return done(err)
							equal(actual.trim(), expected.trim())

							// Complete the test for the file
							done()
						})
					})
				})
			})

			done()
		})
	})
})
