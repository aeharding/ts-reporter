import path from "path";
import * as fse from "fs-extra";
import sloc from "sloc";
import { analyze } from "./analyze";
import { generateReport } from "./generateReport";
import * as cache from "./cache";
import { InterruptError, UncleanGitWorkingTreeError } from "./errors";
import chalk from "chalk";

export * from "./errors";
export { generateReport, analyze };
export interface Options {
  output: string;
  path: string;
  start: string;
  end: string;
  clean?: boolean;
  dark?: boolean;
  ignore?: string[];
}

export type SlocData = Record<sloc.Key, number>;

export interface Stat {
  date: string;
  stats: Stats;
}

export interface Stats {
  js: SlocData;
  ts: SlocData;
}

export default async function run(options: Options) {
  const jsonPath = path.resolve(options.output, "data.json");

  if (options.clean) fse.removeSync(jsonPath);

  const existingStats = await cache.readData(options);

  try {
    const statsPerDay = await analyze(existingStats, options);
    await generateReport(statsPerDay, options);
  } catch (e) {
    if (e instanceof UncleanGitWorkingTreeError) {
      console.log(
        chalk.red(
          "Repo is not clean! Please cleanup your work before proceeding (`git status`)."
        )
      );
      return;
    }

    // exit silently, just needed to wait for things to cleanup
    if (e instanceof InterruptError) return;

    // unknown error
    throw e;
  }
}
