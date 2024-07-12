# GroupName Stage 3 Project

## Overview

[I'll need help with this]

## Table of Contents

- [Overview](#overview)
- [ERD](#erd)
- [SwaggerDocumentation](#swaggerdocumentation)
- [Installation](#installation)
- [Usage](#usage)

## ERD

The Entity Relationship Diagram (ERD) represents the data model and relationships within the project. It provides a visual overview of how the entities (tables) are related to each other. The tables are User, Organisation, Notification and Transaction.

![ERD]("path/to/your/ERD/image.png")

### Enums

**UserRoleEnum**

- `ADMIN`
- `USER`

````mermaid
erDiagram
    User {
        string id PK
        string firstName
        string lastName
        string email
        UserRoleEnum role
    }
    Organisation {
        string id PK
        string name
        string description
        string userId FK
    }
    Notification {
        string id PK
        string name
        string userId FK
        boolean isRead
    }
    Transaction {
        string id PK
        string orgId FK
        string userId FK
        string paymentChannel
        number totalBill
    }

    User ||--o{ Transaction : "has"
    Organisation ||--o{ Transaction : "has"
    User ||--o{ Organisation : "has"
    User ||--o{ Notification : "has"

```

## SwaggerDocumentation

Swagger documentation provides a comprehensive insight to the project's API endpoints, including details about request/response formats, parameters and status codes.
To access the swagger documentation:
[Link to swagger doc here](Link)

# Installation

#### Clone the repository

```
    git clone https://github.com/your-repo/project-name.git
```

### Navigate to the project directory

```
    cd project-name
```

### Install Dependencies

```
    npm install
```

# Usage

To start the Nest Js server run the following command

```
    npm run start:dev
```

The server starts on `http://localhost:3008` by default.
````
