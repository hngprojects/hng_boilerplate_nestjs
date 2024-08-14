#!/bin/bash

BRANCH=$1

# checkout
git checkout $BRANCH;

git pull origin $BRANCH;

# install dependencies
npm install --include=dev;

# run build
npm run build;


git stash

# run migration
npm run migration:run;

# run start
pm2 restart $BRANCH-ecosystem-config.json ||  pm2 start $BRANCH-ecosystem-config.json;
