export async function run(test: () => Promise<void>) {
  try {
    await test();
    //process.exit(0);
  } catch (err) {
    console.log("  ---");
    console.log(`  message: ${err.message}`);
    console.log(`  actual: ${JSON.stringify(err.actual)}`);
    console.log(`  expected: ${JSON.stringify(err.expected)}`);
    console.log(`  source: ${err.stack.split(/\r?\n/)[1].trim()}`);
    console.log("  ...");
    process.exit(1);
  }
}
