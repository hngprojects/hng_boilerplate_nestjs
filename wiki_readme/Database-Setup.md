## Database Setup: PostgreSQL with Docker Compose

This section of the documentation details the setup and configuration of the PostgreSQL databases for the development and staging environments using Docker Compose.

**1. Docker Compose Configuration**

The `docker-compose.yml` file defines the configuration for both PostgreSQL databases:

```yaml
version: '3.3'
services:
  postgresdb-prod:
    image: postgres:13
    restart: always
    env_file:
      - .env
    ports:
      - '5432:5432'
    volumes:
      - db-data-prod:/var/lib/postgresql/data
  postgresdb-staging:
    image: postgres:13
    restart: always
    env_file:
      - ./.env.staging
    ports:
      - '5433:5432'
    volumes:
      - db-data-staging:/var/lib/postgresql/data

volumes:
  db-data-prod:
    driver: local
  db-data-staging:
    driver: local
```

**2. Database Details**

- **`postgresdb-prod`:**

  - **Image:** `postgres:13` (Official PostgreSQL 13 image)
  - **Environment Variables:** Loaded from `.env` file.
  - **Port Mapping:** Exposes PostgreSQL on port `5432` on the host machine.
  - **Data Persistence:** Uses a named volume `db-data-prod` to persist database data.

- **`postgresdb-staging`:**
  - **Image:** `postgres:13`
  - **Environment Variables:** Loaded from `.env.staging` file.
  - **Port Mapping:** Exposes PostgreSQL on port `5433` on the host machine.
  - **Data Persistence:** Uses a named volume `db-data-staging` to persist data.

**3. Environment Variables**

- **`.env` and `.env.staging`:** These files contain environment-specific configurations for the databases, such as:
  - `POSTGRES_DB`: Database name
  - `POSTGRES_USER`: Database username
  - `POSTGRES_PASSWORD`: Database password

**4. Data Persistence**

Both database containers use Docker volumes (`db-data-prod` and `db-data-staging`) to ensure data persistence. This means that even if the containers are stopped and restarted, the database data will be preserved.

**5. Accessing the Databases**

- **`postgresdb-prod`:** Accessible from the host machine via `localhost:5432`.
- **`postgresdb-staging`:** Accessible from the host machine via `localhost:5433`.

**6. Connecting from the Application**

The NestJS application is configured to connect to the appropriate database based on the current environment using the environment variables loaded from the respective `.env` files.

This section outlines the configuration and setup of the PostgreSQL databases using Docker Compose. It ensures data isolation between environments and facilitates easy management and scaling of the database infrastructure.
