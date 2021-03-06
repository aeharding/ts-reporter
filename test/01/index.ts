import assert from "assert";
import fse from "fs-extra";
import { run } from "../utils/misc.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = process.argv[2];

run(async () => {
  const resultDataPath = `${DIR}/reports/ts-migration/data.json`;
  assert.ok(fse.existsSync(resultDataPath));

  const result = fse.readJSONSync(resultDataPath);
  const expected = fse.readJSONSync(`${__dirname}/data.json`);

  delete result.path;
  delete expected.path;
  delete result.version;
  delete expected.version;

  assert.deepStrictEqual(result, expected);

  // TODO - need better solution
  // assert.strictEqual(
  //   (
  //     await execa("shasum", [`${DIR}/reports/ts-migration/image.png`])
  //   ).stdout.split(" ")[0],
  //   fse.readFileSync(`${__dirname}/image.png.shasum`).toString()
  // );
});
