import execa from "execa";
import glob from "glob-promise";
import chalk from "chalk";
import { eachDayOfInterval, isEqual } from "date-fns";
import * as fs from "fs/promises";
import sloc from "sloc";
import * as git from "./git";
import { Options, Stat, StatItem, Stats } from "lib";
import path from "path";
import * as cache from "./cache";

let currentGitRef: string | undefined;
let interrupt = false;

process.on("SIGINT", async () => {
  interrupt = true;
  // give current git commands time to finish up
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (currentGitRef) await git.checkout(currentGitRef);

  process.exit();
});

export default async function analyze(existingStats: Stats, options: Options) {
  let days = eachDayOfInterval({
    start: new Date(options.start),
    end: new Date(options.end),
  }).map((d) => new Date(d.toISOString().slice(0, 10))); // always use GMT

  const relevantExistingStats = existingStats.filter(({ date }) =>
    days.find((day) => isEqual(day, new Date(date)))
  );

  days = days.filter(
    (day) =>
      !relevantExistingStats.find(({ date }) => isEqual(new Date(date), day))
  );

  if (days.length > 0) {
    if (!(await git.isClean())) {
      console.log(
        chalk.red(
          "Repo is not clean! Please cleanup your work before proceeding (`git status`)."
        )
      );

      process.exit(1);
    }
    currentGitRef = await git.getRef();
  }

  const currentCommit = await git.getHEADSha();

  let statsPerDay: Stats = [];
  for (let i = 0; i < days.length; i++) {
    if (interrupt) throw new Error("interrupt");

    const date = days[i];

    let stats: { js: Stat; ts: Stat };

    try {
      stats = await getStatsPerDay(date, currentCommit, options);
    } catch (e) {
      if (e.message !== "not found") throw e;

      stats = {
        js: emptyStat(),
        ts: emptyStat(),
      };
    }

    statsPerDay.push({
      date: date.toISOString(),
      stats,
    });
  }

  statsPerDay = statsPerDay.concat(relevantExistingStats).sort(sortStats);

  await cache.writeData(statsPerDay, options);

  if (currentGitRef) await git.checkout(currentGitRef);
  currentGitRef = undefined;

  return statsPerDay;
}

export function sortStats(a: StatItem, b: StatItem): number {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

async function getStatsPerDay(
  day: Date,
  currentCommit: string,
  options: Options
) {
  console.log("Running for date:", day);

  const { stdout: revision } = await execa("git", [
    "rev-list",
    "-1",
    "--before",
    day.toISOString(),
    currentCommit,
  ]);

  if (!revision) throw new Error("not found");

  await git.checkout(revision);

  const js = await getStatsFor("js", options);
  const ts = await getStatsFor("ts", options);

  return {
    js,
    ts,
  };
}

async function getStatsFor(type: "js" | "ts", options: Options): Promise<Stat> {
  const files = await glob(
    path.resolve(options.path, "**", `*.{${type},${type}x}`),
    {
      ignore: "**/node_modules/**",
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

function emptyStat(): Stat {
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
