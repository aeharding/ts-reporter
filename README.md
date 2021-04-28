# ts-reporter 🚲

Migrating your huge app from Javascript to Typescript? This project provides a burndown chart (as a `.png`, along with raw `.json`) of your remaining LOC to convert!

- See the progress that you're making instead of feeling like you're getting nowhere. 💪
- Easily integrate as an artifact of your CI

![Example burndown chart from a large project](example.png)

## Install in project

```sh
yarn add ts-reporter --dev
# or
npm i ts-reporter --save-dev
```

`package.json`:

```json
{
  "scripts": {
    "build-ts-reporter": "ts-reporter build src/"
  }
}
```

3. Run

```sh
npm run build-ts-reporter
# or
yarn build-ts-reporter

# or directly, without adding to package.json:
npx ts-reporter build src/
```

## Install globally

```sh
yarn global add ts-reporter
# or
npm i --global ts-reporter
```

```sh
ts-reporter build src/
```

## Run as part of build

### Azure Devops

Install ts-reporter:

```sh
yarn add --dev ts-reporter
#or
npm i --save-dev ts-reporter
```

Add to `azure-pipelines.yml`:

```yml
# [...]
    - script: |
        npx ts-reporter build src
    displayName: Run ts-reporter
    - task: PublishPipelineArtifact@1
    inputs:
        targetPath: $(System.DefaultWorkingDirectory)/report
        artifactName: report
# [...]
```

### Something else?

PRs welcome for documentation!
