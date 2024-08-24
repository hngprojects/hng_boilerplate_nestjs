#!/bin/bash

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <env>${NC}"
    exit 1
elif [[ "$1" != "dev" && "$1" != "staging" && "$1" != "prod" ]]; then
    echo -e "${RED}Invalid environment specified. Use dev, staging, or prod.${NC}"
    exit 1
fi

export ENV=$1
BRANCH=$1
PROJECT_NAME="nestjs_$ENV"

if [ "$ENV" == "prod" ]; then
    BRANCH="main"
fi

echo -e "${BLUE}Preparing to deploy to the $ENV environment...${NC}"
echo -e "${YELLOW}Environment: $ENV${NC}"
echo -e "${YELLOW}Branch: $BRANCH${NC}"

echo -e "${GREEN}Loading Docker image from /tmp/nestjs_${ENV}.tar.gz...${NC}"
gunzip -c /tmp/nestjs_${ENV}.tar.gz | docker load
rm -f /tmp/nestjs_${ENV}.tar.gz

echo -e "${GREEN}Stashing local changes and Pulling the latest changes from branch $BRANCH...${NC}"
git add .
git stash
git checkout $BRANCH
git pull origin $BRANCH

echo -e "${BLUE}Starting Blue-Green deployment for environment: $ENV...${NC}"

echo -e "${GREEN}Deploying the green version of the app...${NC}"
docker compose -f compose.yaml -f compose/compose.$ENV.yaml -f compose/compose.green.yaml up -d --no-recreate

echo -e "${GREEN}Transferring traffic to green environment...${NC}"
docker compose -f compose.yaml -f compose/compose.$ENV.yaml -f compose/compose.green.yaml create nginx
        
echo -e "${YELLOW}Cleaning up the blue (old) containers and image...${NC}"
docker compose -f compose.yaml -f compose/compose.$ENV.yaml stop app
docker compose -f compose.yaml -f compose/compose.$ENV.yaml rm -f app
docker rmi -f ${PROJECT_NAME}:latest

echo -e "${GREEN}Promoting the green version to blue (main version)...${NC}"
docker tag ${PROJECT_NAME}:green ${PROJECT_NAME}:latest

echo -e "${BLUE}Starting the blue (main) version of the app...${NC}"
docker compose -f compose.yaml -f compose/compose.$ENV.yaml up -d

echo -e "${YELLOW}Cleaning up the green version after promotion...${NC}"
docker compose -f compose.yaml -f compose/compose.$ENV.yaml -f compose/compose.green.yaml stop app-green
docker compose -f compose.yaml -f compose/compose.$ENV.yaml -f compose/compose.green.yaml rm -f app-green
docker rmi -f ${PROJECT_NAME}:green

echo -e "${GREEN}Blue-Green deployment complete. The blue version is now live.${NC}"
