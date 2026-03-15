const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

const mocha = new Mocha({
  timeout: 20000,
  reporter: 'spec'
});

const testDir = path.join(__dirname, 'tests');

fs.readdirSync(testDir)
  .filter(file => file.endsWith('.test.js'))
  .forEach(file => {
    mocha.addFile(path.join(testDir, file));
  });

console.log('Running tests...');
mocha.run((failures) => {
  const result = `Tests completed. Failures: ${failures}`;
  console.log(result);
  fs.writeFileSync('test_output_mocha_api.txt', result);
  process.exitCode = failures ? 1 : 0;
  process.exit();
});
