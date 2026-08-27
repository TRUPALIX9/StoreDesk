#!/bin/bash
set -e

submodules=("store-desk-electron" "store-desk-worker" "store-desk-mobile" "store-desk-web")

for sub in "${submodules[@]}"; do
  echo "==================== Processing $sub ===================="
  cd "$sub"
  git add .
  git commit -m "chore: migrate and unified installer cleanup" || echo "No changes to commit in $sub"
  git push origin develop || echo "Failed to push develop in $sub"
  git checkout production || git checkout -b production
  git pull origin production || true
  git merge develop -m "Merge develop into production" || echo "Failed to merge in $sub"
  git push origin production || echo "Failed to push production in $sub"
  git checkout develop
  cd ..
done

echo "==================== Processing Parent Repo ===================="
git add .
git commit -m "chore: migrate and unified installer cleanup" || echo "No changes in parent"
git push origin develop || echo "Failed to push develop in parent"
git checkout production || git checkout -b production
git pull origin production || true
git merge develop -m "Merge develop into production" || echo "Failed to merge parent"
git push origin production || echo "Failed to push production in parent"
git checkout develop
