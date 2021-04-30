import assert from "assert";
import * as fse from "fs-extra";
import execa from "execa";
import { run } from "../utils/misc";

const DIR = process.argv[2];

run(async () => {
  const resultDataPath = `${DIR}/reports/ts-migration/data.json`;
  assert.ok(fse.existsSync(resultDataPath));

  const result = fse.readJSONSync(resultDataPath);
  const expected = fse.readJSONSync(`${__dirname}/data.json`);

  delete result.path;
  delete expected.path;

  assert.deepStrictEqual(result, expected);

  assert.strictEqual(
    (
      await execa("shasum", [`${DIR}/reports/ts-migration/image.png`])
    ).stdout.split(" ")[0],
    fse.readFileSync(`${__dirname}/image.png.shasum`).toString()
  );
});
