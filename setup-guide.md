# Quick Start Guide

## How To Start Up The Application

### Cloning the repository
- Fork and clone the repository
```bash
git clone https://github.com/hngprojects/hng_boilerplate_nestjs.git
cd hng_boilerplate_nestjs
git checkout chore/database-setup
```

### Setting Up the Environment

### Prerequisites:

   - #### Ensure you have NodeJs and Npm installed. 
     - You can download and install Node.js from [nodejs.org](https://nodejs.org/).
     -  Check your installation here:
       ```bash
      node -v
      npm -v
      ```
   - #### Ensure you have NestJs installed
     - Install the NestJS CLI globally using npm:

      ```
      npm install -g @nestjs/cli
      ```
     - Check your installation
      ```
      nest -v
      ```

### Database Setup
- #### Ensure PostgreSQL is installed and running.

- #### Update the .env file with your database credentials
  ```
  PROFILE=local
  NODE_ENV=development
  PORT=3008
  DB_TYPE=dt_type
  DB_USERNAME=your_username
  DB_PASSWORD=your_password
  DB_HOST=localhost
  DB_DATABASE=db_name
  DB_ENTITIES=dist/**/*.entity{.ts,.js}
  DB_MIGRATIONS=dist/db/migrations/*{.ts,.js}
  ```

### Running The Application Locally
  - Install all dependencies
  ```
  npm install
  ```
  - Start the application in dev mode
  ```
  npm run start:dev
  ```

### Create And Apply Migration Files
- #### Migration files should be placed in the `db/migration` directory. 
- #### Generate migration files automatically with typeorm 
  ```
  npm run migration:generate
  ```
- #### To manually create migration file
  ```
  npm run migration:create
  ```
- #### Run migration 
  ```
  npm run migration:run
  ```


  #### Create Sample Data 
  - The seed data is run once when app starts

## Testing the Endpoint

### You can test the endpoint using curl or Postman
- Using Curl 
```
curl -X GET http://localhost:3008/api/v1/users/
```

- Using Postman
  * Open Postman.
  * Create a new GET request to http://localhost:3008/api/v1/users.
  * Send the request and verify the response.
- Expected Response
```json
 {
    "id": "d6aa5dc9-a1c3-4516-ad4e-31d169893510",
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@example.com",
    "password": "$2b$10$lOsaGJVjYxxZsVQ2WNsiwe./MEu.MEp2QiXKAS1FwP3gQtctOM2tG",
    "is_active": null,
    "attempts_left": null,
    "time_left": null,
    "created_at": "2024-07-20T13:08:28.273Z",
    "updated_at": "2024-07-20T13:08:28.523Z",
    "profile": {
      "id": "6f8984f8-682a-4bb9-a618-6b14ea109bd3",
      "username": "johnsmith",
      "bio": "bio data",
      "phone": "1234567890",
      "avatar_image": "image.png"
    },
    "products": [
      {
        "id": "61c30739-1b7e-447a-b58e-3b05e0e7c0d3",
        "product_name": "Product 1",
        "product_price": 100,
        "description": "Description 1"
      }
    ],
    "organisations": [
      {
        "org_id": "c52d7c25-8632-4b08-91d1-1f9a837f1861",
        "org_name": "Org 1",
        "description": "Description 1"
      },
      {
        "org_id": "4b42ea8e-e1e2-407e-88cb-9893c05a4167",
        "org_name": "Org 2",
        "description": "Description 2"
      }
    ]
  }
```

- There are 2 default users created when you start the application. 
- To get the sample data, use this route after starting the application:
```
http://localhost:3008/api/v1/seed/users
```
- Also, you can get the users by signing in to your database and query the users table using:
`SELECT * FROM users;`# Quick Start Guide

## How To Start Up The Application

### Cloning the repository
- Fork and clone the repository
```bash
git clone https://github.com/hngprojects/hng_boilerplate_nestjs.git
cd hng_boilerplate_nestjs
git checkout chore/database-setup
```

### Setting Up the Environment

### Prerequisites:

   - #### Ensure you have NodeJs and Npm installed. 
     - You can download and install Node.js from [nodejs.org](https://nodejs.org/).
     -  Check your installation here:
       ```bash
      node -v
      npm -v
      ```
   - #### Ensure you have NestJs installed
     - Install the NestJS CLI globally using npm:

      ```
      npm install -g @nestjs/cli
      ```
     - Check your installation
      ```
      nest -v
      ```

### Database Setup
- #### Ensure PostgreSQL is installed and running.

- #### Update the .env file with your database credentials
  ```
  PROFILE=local
  NODE_ENV=development
  PORT=3008
  DB_TYPE=dt_type
  DB_USERNAME=your_username
  DB_PASSWORD=your_password
  DB_HOST=localhost
  DB_DATABASE=db_name
  DB_ENTITIES=dist/**/*.entity{.ts,.js}
  DB_MIGRATIONS=dist/db/migrations/*{.ts,.js}
  ```

### Running The Application Locally
  - Install all dependencies
  ```
  npm install
  ```
  - Start the application in dev mode
  ```
  npm run start:dev
  ```

### Create And Apply Migration Files
- #### Migration files should be placed in the `db/migration` directory. 
- #### Generate migration files automatically with typeorm 
  ```
  npm run migration:generate
  ```
- #### To manually create migration file
  ```
  npm run migration:create
  ```
- #### Run migration 
  ```
  npm run migration:run
  ```


  #### Create Sample Data 
  - The seed data is run once when app starts

## Testing the Endpoint

### You can test the endpoint using curl or Postman
- Using Curl 
```
curl -X GET http://localhost:3008/api/v1/users/
```

- Using Postman
  * Open Postman.
  * Create a new GET request to http://localhost:3008/api/v1/users.
  * Send the request and verify the response.
- Expected Response
```json
 {
    "id": "d6aa5dc9-a1c3-4516-ad4e-31d169893510",
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@example.com",
    "password": "$2b$10$lOsaGJVjYxxZsVQ2WNsiwe./MEu.MEp2QiXKAS1FwP3gQtctOM2tG",
    "is_active": null,
    "attempts_left": null,
    "time_left": null,
    "created_at": "2024-07-20T13:08:28.273Z",
    "updated_at": "2024-07-20T13:08:28.523Z",
    "profile": {
      "id": "6f8984f8-682a-4bb9-a618-6b14ea109bd3",
      "username": "johnsmith",
      "bio": "bio data",
      "phone": "1234567890",
      "avatar_image": "image.png"
    },
    "products": [
      {
        "id": "61c30739-1b7e-447a-b58e-3b05e0e7c0d3",
        "product_name": "Product 1",
        "product_price": 100,
        "description": "Description 1"
      }
    ],
    "organisations": [
      {
        "org_id": "c52d7c25-8632-4b08-91d1-1f9a837f1861",
        "org_name": "Org 1",
        "description": "Description 1"
      },
      {
        "org_id": "4b42ea8e-e1e2-407e-88cb-9893c05a4167",
        "org_name": "Org 2",
        "description": "Description 2"
      }
    ]
  }
```

- There are 2 default users created when you start the application. 
- To get the sample data, use this route after starting the application:
```
http://localhost:3008/api/v1/seed/users
```
- Also, you can get the users by signing in to your database and query the users table using:
`SELECT * FROM users;`