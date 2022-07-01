#!/bin/bash
np=$(npm bin)"/np"

echo "Enter release version (major/minor/patch)."
read -r version

echo "Executing dryrun..."
for package in packages/* ; do
  cd "$package" || exit 2
  echo "CWD: $PWD"
  "$np" "$version" --no-publish --any-branch --no-release-draft --preview || exit 3
  cd ../.. || exit 4
done
echo "CWD: $PWD"
"$np" "$version" --preview || exit 5

echo "Are you sure? (Y/[N])"
read -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Executing release..."
  for package in packages/* ; do
    cd "$package" || exit 6
    echo "CWD: $PWD"
    "$np" "$version" --yolo --no-release-draft || exit 7
    git add package.json || exit 8
    git commit -m "Bump version for $package" || exit 9
    cd .. || exit 10
  done
  echo "CWD: $PWD"
  "$np" "$version" --yolo --no-publish || exit 11
fi
