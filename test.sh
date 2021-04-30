#!/bin/bash

N=0
F=0
T="$(pwd)/temp"
V=$(node -v)
D=$(date +%F_%T)

echo "TAP version 13"
echo "# Node Version: $V"
for TESTDIR in $(ls -d test/??); do
  FILE="$TESTDIR/index.ts"
  DIR="$T/$D/$N"
  rm -rf "$DIR"
  mkdir -p "$DIR"
  N=$(($N + 1))
  echo "# File: $FILE" 1>&2
  echo "# Directory: $DIR" 1>&2
  ./$
  OLDPWD=$(pwd)
  cd $DIR
  ../../../"$TESTDIR"/setup.sh "$DIR"
  cd $OLDPWD
  npx ts-node "$FILE" "$DIR"
  if [ $? = 0 ]; then
    echo "ok $N $FILE"
  else
    F=$(($F + 1))
    echo "not ok $N $FILE"
  fi
done
echo "1..$N"
# rm -rf "$T"

exit $F