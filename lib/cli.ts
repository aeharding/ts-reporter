#!/usr/bin/env node

import { subDays } from "date-fns";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import run from "./index.js";

yargs(hideBin(process.argv))
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .option("dark", {
    alias: "d",
    type: "boolean",
    description: "Generate a dark themed report",
  })
  .option("clean", {
    alias: "c",
    type: "boolean",
    description: "Ignore data.json cache and force analyzing git history",
  })
  .option("output", {
    alias: "o",
    type: "string",
    description: "Folder path to output artifacts",
    default: path.join("reports", "ts-migration"),
  })
  .option("start", {
    alias: "s",
    type: "string",
    description: "First day (start bound) of analysis",
    default: subDays(new Date(), 90).toISOString().slice(0, 10),
  })
  .option("ignore", {
    alias: "i",
    type: "array",
    description: "Ignore certain paths",
    default: [],
  })
  .alias("start", "from")
  .option("end", {
    alias: "e",
    type: "string",
    description: "Last day (end bound) of analysis",
    default: new Date().toISOString().slice(0, 10),
  })
  .alias("end", "to")
  .command(
    "build [path]",
    "generate the output artifacts",
    (yargs) => {
      return yargs.positional("path", {
        describe: "Folder path for project",
        default: "src/",
      });
    },
    (argv) => {
      run(argv);
    }
  )
  .demandCommand()
  .help().argv;
