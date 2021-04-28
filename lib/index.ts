import path from "path";
import * as fse from "fs-extra";
import sloc from "sloc";
import analyze from "./analyze";
import generateReport from "./generateReport";
import * as cache from "./cache";

export interface Options {
  output: string;
  path: string;
  start: string;
  end: string;
  clean?: boolean;
  dark?: boolean;
}

export type Stat = Record<sloc.Key, number>;

export type StatItem = {
  date: string;
  stats: {
    js: Stat;
    ts: Stat;
  };
};
export type Stats = StatItem[];

export default async function run(options: Options) {
  const jsonPath = path.resolve(options.output, "data.json");

  if (options.clean) fse.removeSync(jsonPath);

  const existingStats = await cache.readData(options);

  try {
    const statsPerDay = await analyze(existingStats, options);
    await generateReport(statsPerDay, options);
  } catch (e) {
    if (e.message === "interrupt") return;
    throw e;
  }
}
