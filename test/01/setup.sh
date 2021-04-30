git init
echo "{}" > package.json
echo "const foo = 0;\n const bar = 1;\n const baz = 2;" > code1.js
git add .
git commit -m "commit 1" --date "12-31-20T00:00:00.000Z"
echo "ts codes 1" > code2.ts
git add .
git commit -m "commit 2" --date "01-01-21T00:00:00.000Z"
echo "ts codes 2" > code3.ts
git add .
git commit -m "commit 3" --date "01-02-21T00:00:00.000Z"

git rebase --root --committer-date-is-author-date

npx ts-reporter build . --from 2021-01-01 --to 2021-01-03