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

env=$1
branch=$env
PROJECT_NAME="nestjs_$env"

if [ "$env" == "prod" ]; then
    branch="main"
fi

echo -e "${BLUE}Preparing to deploy to the $env environment...${NC}"
echo -e "${YELLOW}Environment: $env${NC}"
echo -e "${YELLOW}Branch: $branch${NC}"

echo -e "${GREEN}Loading Docker image from /tmp/nestjs_${env}.tar.gz...${NC}"
gunzip -c /tmp/nestjs_${env}.tar.gz | docker load
rm -f /tmp/nestjs_${env}.tar.gz

echo -e "${GREEN}Stashing local changes and Pulling the latest changes from branch $branch...${NC}"
cd ~/hng_boilerplate_nestjs
git add .
git stash
git checkout $branch
git pull origin $branch

echo -e "${BLUE}Starting Blue-Green deployment for environment: $env...${NC}"

echo -e "${GREEN}Deploying the green version of the app...${NC}"
docker compose -f compose.yml -f compose.$env.yml -f compose.green.yml up -d
        
echo -e "${YELLOW}Cleaning up the blue (old) containers and image...${NC}"
docker compose -f compose.yml -f compose.$env.yml stop app
docker compose -f compose.yml -f compose.$env.yml rm -f app
docker rmi -f ${PROJECT_NAME}:latest

echo -e "${GREEN}Promoting the green version to blue (main version)...${NC}"
docker tag ${PROJECT_NAME}:green ${PROJECT_NAME}:latest

echo -e "${BLUE}Starting the blue (main) version of the app...${NC}"
docker compose -f compose.yml -f compose.$env.yml up -d

echo -e "${YELLOW}Cleaning up the green version after promotion...${NC}"
docker compose -f compose.yml -f compose.$env.yml -f compose.green.yml stop app-green
docker compose -f compose.yml -f compose.$env.yml -f compose.green.yml rm -f app-green
docker rmi -f ${PROJECT_NAME}:green

echo -e "${GREEN}Blue-Green deployment complete. The blue version is now live.${NC}"
