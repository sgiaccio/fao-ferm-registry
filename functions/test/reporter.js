const mocha = require('mocha');

// Store the original console.log
const originalLog = console.log;
let testTitle = '';

class CustomReporter extends mocha.reporters.Spec {
    constructor(runner) {
        super(runner);

        // Capture console.log
        console.log = function(msg) {
            if (testTitle) {
                // Indent console.log messages under the current test
                originalLog(`    → ${msg}`);
            }
        };

        runner.on('test', function(test) {
            testTitle = test.title;
            originalLog(`\n${testTitle}`);
        });

        runner.on('test end', function() {
            testTitle = '';
        });
    }
}

module.exports = CustomReporter; 
