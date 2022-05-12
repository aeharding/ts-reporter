import { execa } from "execa";
import glob from "glob-promise";
import { eachDayOfInterval, format, isEqual, parse } from "date-fns";
import * as fs from "fs/promises";
import sloc from "sloc";
import * as git from "./git.js";
import { Options, SlocData, Stat, Stats } from "./index.js";
import path from "path";
import * as cache from "./cache.js";
import { UncleanGitWorkingTreeError, InterruptError } from "./errors.js";

let currentGitRef: string | undefined;
let interrupt = false;

process.on("SIGINT", async () => {
  interrupt = true;
  // give current git commands time to finish up
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (currentGitRef) await git.checkout(currentGitRef);

  process.exit();
});

/**
 *
 * @param existingStats Cached stats. If passed [], will run clean.
 * @param options CLI options
 * @returns Stats of project
 * @throws UncleanGitWorkingTreeError
 */
export async function analyze(
  existingStats: Stat[],
  options: Options
): Promise<Stat[]> {
  let days = eachDayOfInterval({
    start: parse(options.start, "yyyy-LL-dd", new Date()),
    end: parse(options.end, "yyyy-LL-dd", new Date()),
  }).map((d) => new Date(format(d, "yyyy-LL-dd"))); // always use GMT

  const relevantExistingStats = existingStats.filter(({ date }) =>
    days.find((day) => isEqual(day, new Date(date)))
  );

  days = days.filter(
    (day) =>
      !relevantExistingStats.find(({ date }) => isEqual(new Date(date), day))
  );

  if (days.length > 0) {
    if (!(await git.isClean())) {
      throw new UncleanGitWorkingTreeError();
    }
    currentGitRef = await git.getRef();
  }

  const currentCommit = await git.getHEADSha();

  let statsPerDay: Stat[] = [];
  for (let i = 0; i < days.length; i++) {
    if (interrupt) throw new InterruptError();

    const date = days[i];

    const stats = await getStatsPerDay(date, currentCommit, options);

    statsPerDay.push({
      date: date.toISOString(),
      stats: stats || {
        js: emptyStat(),
        ts: emptyStat(),
      },
    });
  }

  statsPerDay = statsPerDay.concat(relevantExistingStats).sort(sortStats);

  await cache.writeData(statsPerDay, options);

  if (currentGitRef) await git.checkout(currentGitRef);
  currentGitRef = undefined;

  return statsPerDay;
}

export function sortStats(a: Stat, b: Stat): number {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

async function getStatsPerDay(
  day: Date,
  currentCommit: string,
  options: Options
): Promise<Stats | undefined> {
  console.log("Running for date:", day);

  const { stdout: revision } = await execa("git", [
    "rev-list",
    "-1",
    "--before",
    day.toISOString(),
    currentCommit,
  ]);

  if (!revision) return;

  await git.checkout(revision);

  const js = await getStatsFor("js", options);
  const ts = await getStatsFor("ts", options);

  return {
    js,
    ts,
  };
}

async function getStatsFor(
  type: "js" | "ts",
  options: Options
): Promise<SlocData> {
  const files = await glob(
    path.resolve(options.path, "**", `*.{${type},${type}x}`),
    {
      ignore: [
        "**/node_modules/**",
        ...(options.ignore?.map((p) => path.resolve(p)) || []),
      ],
    }
  );
  const fileContents = await Promise.all(files.map((f) => fs.readFile(f)));

  const statsPerFile = fileContents.map((f) => sloc(f.toString(), type));

  const stats = !statsPerFile.length
    ? emptyStat()
    : statsPerFile.reduce((acc, currentValue) => {
        Object.keys(acc).forEach((_k) => {
          const k = _k as sloc.Key;
          acc[k] += currentValue[k];
        });

        return acc;
      });

  return stats;
}

function emptyStat(): SlocData {
  return {
    total: 0,
    source: 0,
    comment: 0,
    single: 0,
    block: 0,
    mixed: 0,
    blockEmpty: 0,
    empty: 0,
    todo: 0,
  };
}
