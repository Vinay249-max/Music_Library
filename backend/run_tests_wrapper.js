const { exec } = require('child_process');

console.log("Starting tests...");
exec('npm test', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing tests: ${error.message}`);
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
  }
  console.log(`Stdout:\n${stdout}`);
  
  // Write output to file as well just in case
  require('fs').writeFileSync('test_output_node.txt', stdout + '\n\n' + stderr);
  console.log("Output written to test_output_node.txt");
});
