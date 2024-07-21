## NestJS Boilerplate Project Documentation

Welcome to the comprehensive documentation for our NestJS boilerplate project. This guide will walk you through the setup and integration of advanced CI/CD pipelines, messaging queues, and deployment processes using GitHub Actions. Our goal is to automate build, test, and deployment tasks, improve service communication via messaging queues, and ensure reliable deployments.

**Table of Contents**

- [Introduction](#introduction)
- [CI/CD Setup](#cicd-setup)
  - [Choosing CI/CD Tool](#choosing-cicd-tool)
  - [Pipeline Setup](#pipeline-setup)
  - [Branching Strategy](#branching-strategy)
- [Database Setup](#database-setup)
  - [Configuration](#configuration)
- [Messaging Queue Integration](#messaging-queue-integration)
  - [RabbitMQ Setup](#rabbitmq-setup)
  - [Integration with NestJS](#integration-with-nestjs)
- [Deployment](#deployment)
  - [Server Setup](#server-setup)
  - [Deployment Process](#deployment-process)
  - [Domain Name Configuration](#domain-name-configuration)
- [Documentation](#documentation)
- [Getting Started](#getting-started)

## Introduction

This project aims to streamline the management, deployment, and communication of boilerplate projects. Using GitHub Actions for CI/CD, RabbitMQ for messaging queues, and Docker for database management, we ensure a robust and efficient development environment.

## CI/CD Setup

The CI/CD pipeline automates the build, test, and deployment processes of the application, ensuring code quality and efficient delivery.

### Choosing CI/CD Tool

For this project, we selected GitHub Actions due to its seamless integration with our GitHub repository and powerful automation capabilities.

### Pipeline Setup

We have configured the CI/CD pipelines to automate the build, test, and deployment processes for the NestJS boilerplate project. The pipeline runs on each pull request and push to the `dev`, `staging`, and `main` branches.

CI/CD Workflow

- **Build**: This job checks out the codebase, installs dependencies, and builds the application.
- **Test**: Executes unit and integration tests to ensure code quality and functionality.
- **Deploy**: Deploys the application to the designated environment (development, staging, or production).

The workflow is triggered on every push to the repository and on pull requests.

### Branching Strategy

The project follows a Gitflow-like branching strategy:

- **main**: Represents the production-ready codebase.
- **dev**: The main development branch. Merged into main for releases.
- **staging**: The main staging branch.

## Database Setup

Two separate PostgreSQL databases are set up using Docker containers: one for the development environment and one for production. This approach ensures data isolation and allows for independent database configurations.

### Configuration

The databases are configured in the `docker-compose.yml` file and connected to the application through environment variables.

## Messaging Queue Integration

We utilize RabbitMQ as the message broker for this project.

### RabbitMQ Setup

RabbitMQ is installed and runs on the remote server.

### Integration with NestJS

The NestJS application is configured to connect to the RabbitMQ server. We use the @nestjs/microservices package to implement message producers and consumers within the application.

## Deployment

The deployment process is automated through the CI/CD pipeline, aiming for 99% uptime. Projects are accessible via their respective domain names, and DNS settings are configured accordingly.

### Server Setup

The application is deployed to a remote server. Ensure the server meets the following requirements:

- Node.js and npm installed
- Docker and Docker Compose installed
- Nginx installed and configured as a reverse proxy

### Deployment Process

The CI/CD pipeline builds and tests the application to ensure code quality and functionality. The deployment process involves several steps to set up and configure the environment, including database setup, RabbitMQ installation, NGINX proxy configuration, and using PM2 as the process manager to reload the NestJS application.

#### Steps for Deployment

1. **CI/CD Pipeline Execution**

   - The pipeline is triggered by a push or pull request to the repository.
   - The pipeline checks out the code, installs dependencies, runs tests, and builds the project.
   - Upon successful build and test, the pipeline deploys the application to the target environment (development, staging, or production).

2. **Database Setup**

   - Two separate PostgreSQL databases are configured using Docker containers: one for development and one for production.
   - Docker Compose is used to manage the database containers, ensuring they are isolated and correctly configured.
   - Environment variables are set to connect the NestJS application to the appropriate database.

3. **RabbitMQ Installation**

   - RabbitMQ is installed on the remote server to handle messaging queues for the application.
   - The RabbitMQ service is configured to start on boot and is integrated into the NestJS application using environment variables.

4. **NGINX Proxy Configuration**

   - NGINX is used as a reverse proxy to route incoming requests to the NestJS application.
   - The NGINX configuration file is set up to forward requests to the appropriate port where the NestJS application is running.
   - SSL certificates are configured in NGINX for secure communication if necessary.
   - The NGINX service is restarted to apply the new configuration.

5. **Using PM2 as the Process Manager**

   - PM2 is used to manage the NestJS application processes.
   - The application is started using PM2, which ensures it runs in the background and restarts automatically on failure.
   - The deployment script reloads the application using PM2 to apply any new changes.

6. **Deployment Script Execution**
   - A deployment script (`deployment.sh`, `main-deployment.sh`, `staging-deployment.sh`) is used to automate the deployment tasks.
   - The script includes steps to pull the latest code, install dependencies, build the project, and reload the application using PM2.
   - Environment variables are sourced to ensure all configurations are correctly applied.

### Domain Name Configuration

- We configured DNS records for [Main](https://api-nestjs.boilerplate.hng.tech),
  [Staging](https://staging.api-nestjs.boilerplate.hng.tech),
  [Dev](https://deployment.api-nestjs.boilerplate.hng.tech) to point to the server's IP address.
- Set up Nginx to act as a reverse proxy, directing traffic to the appropriate application based on the domain name.

## Documentation

All processes are documented comprehensively in this GitHub Wiki. Each section covers detailed steps, configurations, and commands used in the setup and deployment of the application.

### [CI/CD Pipelines](cicd-pipeline)

Automated processes for build, test, and deployment are detailed, including YAML configurations and environment setups.

### [Messaging Queue Integration](rabbitmq-installation-and-setup)

Documentation covers the installation, configuration, and integration of RabbitMQ into the NestJS project.

### [NGINX Configuration ](nginx-configuration)

This outlines the NGINX configuration used for routing traffic to our NestJS applications deployed on different ports and subdomains.

### [Database Setup](database-setup)

Step-by-step guides on setting up and configuring Postgres databases in Docker containers for development and production.

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure environment variables (database connection details, RabbitMQ credentials, etc.).
4. Start the application: `npm run start:dev`, `npm run start:staging`, `npm run start:prod`
