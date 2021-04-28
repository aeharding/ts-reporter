# ts-reporter 🚲

Migrating your huge app from Javascript to Typescript? This project provides a burndown chart (as a `.png`, along with raw `.json`) of your remaining LOC to convert!

- See the progress that you're making instead of feeling like you're getting nowhere. 💪
- Easily integrate as an artifact of your CI

![Example burndown chart from a large project](example.png)

## Run Manually

1.  Install:

```sh
yarn global add ts-reporter
# or
npm i --global ts-reporter
```

2.  **IMPORTANT** Clean your git repo of current work. `ts-reporter` needs to checkout old code to analyze your past progress.

3.  Run:

```sh
ts-reporter build src/
```

## Run as part of build

### Azure Devops

(todo)

### Something else?

PRs welcome for documentation!
