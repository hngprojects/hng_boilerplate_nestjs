### CI/CD Pipeline

The CI/CD pipeline for our NestJS project automates the build, test, and deployment processes, ensuring code quality and efficient delivery. We utilize GitHub Actions to orchestrate these operations across different environments—development, staging, and production.

#### GitHub Actions Workflow

Our CI/CD workflow is defined across three GitHub Actions configuration files: `dev.yml`, `staging.yml`, and `main.yml`. These workflows handle the continuous integration and deployment tasks specific to their respective branches. Below are the key components of each workflow:

1. **Build**: Checks out the codebase, sets up Node.js, installs dependencies, and builds the application.
2. **Test**: Executes unit tests to validate code quality and functionality.
3. **Deploy**: Deploys the application to the provided remote environment, controlled by branch-specific triggers.

#### Detailed Workflow Configuration

##### Development Environment (`dev.yml`)

```yaml
name: CI/CD-Dev

on:
  pull_request:
    branches:
      - dev
  push:
    branches:
      - dev

jobs:
  test-and-build-dev:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install --include=dev

      - name: Build project
        run: npm run build

      - name: Run tests
        run: npm run test

  deploy-push:
    runs-on: ubuntu-latest
    if: github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install --include=dev

      - name: Build project
        run: npm run build

      - name: Run tests
        run: npm run test

      - name: Deploying to virtual machine
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          # key: ${{ secrets.SERVER_PRIVATE_KEY }}
          password: ${{ secrets.SERVER_PASSWORD }}
          port: ${{ secrets.SERVER_PORT }}
          script: |
            echo "hello"
            export PATH=$PATH:/home/teamalpha/.nvm/versions/node/v20.15.1/bin
            bash ~/deployment.sh
```

This workflow is triggered on both pull requests and pushes to the `dev` branch.

**1. Pull Request Triggered:**

- **Checkout Code:** The repository's code is checked out.
- **Set up Node.js:** The specified Node.js version (18) is set up on the runner.
- **Install Dependencies:** Project dependencies, including development dependencies, are installed using `npm install --include=dev`.
- **Build Project:** The project is built using `npm run build`.
- **Run Tests:** Unit and integration tests are executed to ensure code quality using `npm run test`.

**2. Push Triggered:**

- **Checkout Code:** The repository's code is checked out.
- **Set up Node.js:** The specified Node.js version (18) is set up on the runner.
- **Install Dependencies:** Project dependencies, including development dependencies, are installed using `npm install --include=dev`.
- **Build Project:** The project is built using `npm run build`.
- **Run Tests:** Unit and integration tests are executed to ensure code quality using `npm run test`.
- **Deploying to Virtual Machine:**
  - The workflow uses the `appleboy/ssh-action@v1.0.3` GitHub Action to establish an SSH connection to the development server.
  - Authentication is handled securely using the server's host, username, and password, which are stored as encrypted secrets within the GitHub repository settings.
  - Once connected, the workflow executes the `~/deployment.sh` script located on the server. This script handles the environment-specific deployment tasks, such as building and deploying the Docker image, updating environment variables, and restarting the application.

##### Staging Environment (`staging.yml`)

```yaml
name: CI/CD--Staging

on:
  pull_request:
    branches:
      - staging
  push:
    branches:
      - staging

jobs:
  test-and-build-staging:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install --include=dev

      - name: Build project
        run: npm run build

      - name: Run tests
        run: npm run test

  deploy-staging:
    runs-on: ubuntu-latest
    # needs: test-and-build-main
    if: github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install --include=dev

      - name: Build project
        run: npm run build

      - name: Run tests
        run: npm run test

      - name: Deploying to virtual machine
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          # key: ${{ secrets.SERVER_PRIVATE_KEY }}
          password: ${{ secrets.SERVER_PASSWORD }}
          port: ${{ secrets.SERVER_PORT }}
          script: |
            echo "hello"
            export PATH=$PATH:/home/teamalpha/.nvm/versions/node/v20.15.1/bin
            bash ~/staging-deployment.sh
```

This workflow is very similar to the `dev.yml` workflow but is specifically designed for the `staging` branch and deploys to the staging environment.

**1. Pull Request Triggered:**

- **Checkout Code:** The repository's code is checked out.
- **Set up Node.js:** The specified Node.js version (18) is set up on the runner.
- **Install Dependencies:** Project dependencies, including development dependencies, are installed using `npm install --include=dev`.
- **Build Project:** The project is built using `npm run build`.
- **Run Tests:** Unit and integration tests are executed to ensure code quality using `npm run test`.

**2. Push Triggered:**

- **Checkout Code:** The repository's code is checked out.
- **Set up Node.js:** The specified Node.js version (18) is set up on the runner.
- **Install Dependencies:** Project dependencies, including development dependencies, are installed using `npm install --include=dev`.
- **Build Project:** The project is built using `npm run build`.
- **Run Tests:** Unit and integration tests are executed to ensure code quality using `npm run test`.
- **Deploying to Virtual Machine:**
  - The workflow uses the `appleboy/ssh-action@v1.0.3` GitHub Action to establish an SSH connection to the staging server.
  - Authentication is handled securely using the server's host, username, and password, which are stored as encrypted secrets within the GitHub repository settings.
  - Once connected, the workflow executes the `~/staging-deployment.sh` script located on the server. This script handles the staging-specific deployment tasks, such as building and deploying the Docker image, updating environment variables, and restarting the application.

##### Production Environment (`main.yml`)

```yaml
name: CI/CD--Main

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

jobs:
  test-and-build-main:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install --include=dev

      - name: Build project
        run: npm run build

      - name: Run tests
        run: npm run test

  deploy-main:
    runs-on: ubuntu-latest
    # needs: test-and-build-main
    if: github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install --include=dev

      - name: Build project
        run: npm run build

      - name: Run tests
        run: npm run test

      - name: Deploying to virtual machine
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          # key: ${{ secrets.SERVER_PRIVATE_KEY }}
          password: ${{ secrets.SERVER_PASSWORD }}
          port: ${{ secrets.SERVER_PORT }}
          script: |
            echo "hello"
            export PATH=$PATH:/home/teamalpha/.nvm/versions/node/v20.15.1/bin
            bash ~/main-deployment.sh
```

This workflow manages the deployment to the production environment and is triggered by pull requests and pushes to the `main` branch.

**1. Pull Request Triggered:**

- **Checkout Code:** The repository's code is checked out.
- **Set up Node.js:** The specified Node.js version (18) is set up on the runner.
- **Install Dependencies:** Project dependencies, including development dependencies, are installed using `npm install --include=dev`.
- **Build Project:** The project is built using `npm run build`.
- **Run Tests:** Unit and integration tests are executed to ensure code quality using `npm run test`.

**2. Push Triggered:**

- **Checkout Code:** The repository's code is checked out.
- **Set up Node.js:** The specified Node.js version (18) is set up on the runner.
- **Install Dependencies:** Project dependencies, including development dependencies, are installed using `npm install --include=dev`.
- **Build Project:** The project is built using `npm run build`.
- **Run Tests:** Unit and integration tests are executed to ensure code quality using `npm run test`.
- **Deploying to Virtual Machine:**
  - The workflow uses the `appleboy/ssh-action@v1.0.3` GitHub Action to establish a secure SSH connection to the production server.
  - Authentication is handled using server credentials (host, username, password) stored as encrypted secrets within the GitHub repository settings.
  - Once connected, the workflow executes the `~/main-deployment.sh` script located on the production server. This script handles the production-specific deployment tasks, such as building and deploying the Docker image, updating environment variables, and restarting the application.

#### Branching Strategy

- **Main**: Represents the production-ready codebase.
- **Dev**: Serves as the main development branch. Changes here are merged into `main` for releases.
- **Staging**: Used for final testing before production. Deployed to a subdomain or a specific path mimicking production settings.

#### Security and Secrets

GitHub Secrets are used to securely handle deployment credentials and configurations, ensuring that sensitive information is not exposed in the workflow files. These secrets are set in the repository settings under "Settings > Secrets and variables."

#### Deployment Scripts

Each environment uses a custom deployment script (`deployment.sh`, `main-deployment.sh`, `staging-deployment.sh`) executed via SSH to the virtual machine. This script is responsible for additional setup tasks and bringing the application online in the respective environments.

This setup not only ensures the application's stability and security but also facilitates a streamlined development-to-deployment flow.
