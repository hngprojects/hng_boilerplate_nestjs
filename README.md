# GroupName Stage 3 Project

## Overview

[I'll need help with this]

## Table of Contents

- [Overview](#overview)
- [ERD](#erd)
- [SwaggerDocumentation](#swagger documentation)
- [Installation](#installation)
- [Usage](#usage)

## ERD

The Entity Relationship Diagram (ERD) represents the data model and relationships within the project. It provides a visual overview of how the entities (tables) are related to each other. The tables are User, Organisation, Notification and Transaction.

![ERD](path/to/your/ERD/image.png)

### Enums

**UserRoleEnum**

- `ADMIN`
- `USER`

```mermaid
ERD
    User {
        id string PK
        firstName string
        lastName string
        email  string
        role   UseRoleEnum
    }

    Organisation {
        id string PK
        name string
        description string
        userId  FK
    }

    Notification {
        id string PK
        name string
        userId string
        isRead boolean
    }

    Transaction {
        id string PK
        orgId FK
        userId FK
        paymentChannel string
        totalBill number
    }

    User ||--o{  Transactions : "has"
    Organisations ||--o{  Transactions: "has"
    User ||--o{  Organisations: "has"
    User ||--o{  Notifications: "has"
```

## Swagger Documentation

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
