#!/bin/bash

BRANCH=$1

# install dependencies
npm install --include=dev;

# run build
npm run build;

# run migration
npm run migration:run;

# run start
pm2 restart $BRANCH-ecosystem-config.json ||  pm2 start $BRANCH-ecosystem-config.json;
