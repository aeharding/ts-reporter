import path from "path";
import fse from "fs-extra";
import sloc from "sloc";
import { analyze } from "./analyze.js";
import { generateReport } from "./generateReport.js";
import * as cache from "./cache.js";
import { InterruptError, UncleanGitWorkingTreeError } from "./errors.js";
import chalk from "chalk";

export * from "./errors.js";
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
