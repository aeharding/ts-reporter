import pathFs from "path";
import fse from "fs-extra";
import { Options, Stat } from "./index.js";
import uniqBy from "lodash/uniqBy.js";
import { sortStats } from "./analyze.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const VERSION: string = fse.readJSONSync(
  pathFs.resolve(__dirname, "../package.json")
).version;

let cachedFileCache: FileCache | undefined;

interface FileCache {
  data: Stat[];
  path: string;
  version: string;
}

export async function readData(options: Options): Promise<Stat[]> {
  const outputPath = getOutputPath(options);
  if (!(await fse.pathExists(outputPath))) return [];

  const fileCache = await read(options);
  if (!fileCache) return [];
  return fileCache.data;
}

export async function writeData(data: Stat[], options: Options): Promise<void> {
  const outputPath = getOutputPath(options);

  const allData = uniqBy(
    (cachedFileCache?.data || []).concat(data).sort(sortStats),
    (v) => v.date
  );

  await fse.outputJSON(outputPath, create(options.path, allData), {
    spaces: 2,
  });
}

async function read(options: Options): Promise<FileCache | null> {
  const outputPath = getOutputPath(options);

  const result: FileCache | null = await fse.readJSON(outputPath, {
    throws: false,
  });

  if (
    !result ||
    result.version !== VERSION ||
    result.path !== pathFs.resolve(options.path)
  )
    return null;

  cachedFileCache = result;

  return result;
}

function create(path: string, data: Stat[] = []): FileCache {
  return {
    data,
    path: pathFs.resolve(path),
    version: VERSION,
  };
}

function getOutputPath(options: Options): string {
  return pathFs.resolve(options.output, "data.json");
}
