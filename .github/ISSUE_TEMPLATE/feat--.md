---
name: 'feat: '
about: Template for feature tasks
title: "[FEAT]"
labels: feature
assignees: ''

---

## Acceptance Criteria



Acceptance Criteria
-------------------

### User Registration \[POST\] /api/auth/register

1.  Registration Endpoint
    

*   Given a request with valid user details (ie email, password), when the user registers, then the system should create a new user account with a 201 created status code.
    

1.  Unique Email
    

*   Given a email that already exists, when the user tries to register, then the system should return a 400 bad request error status with an appropriate error message
    

1.  Password Encryption
    

*   Given a user registration request, when the user registers, then the system should store the password in an encrypted form.
    

#### Request

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   POST /api/auth/register  {    "firstName": String,    "lastName": String,    "email": String,    "password": String,    "confirmPassword": String  }   `

#### Successful Response

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "message": String,    "user": {      "id": String,      "email": String,    },  }   `

#### Error Response

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "message": String,    "error": String,    "statusCode": Int,  }   `

### User Login \[POST\] /api/login

1.  email and Password Validation
    

*   Given a request with valid email and password, when the user logs in, the system should authenticate the user and provide a token.
    
*   Given a request with invalid email or password, when the user logs in, then the system should return a 401 Unauthorized status.
    

1.  Token Generation
    

*   Given valid login credentials, when the user logs in, the system should generate a JWT token.
    

1.  Token Expiry
    

*   The generated token should have an expiry time configured - 1 hour.
    
*   Given an expired token, when the user tries to access a protected route, then the system should return a 401 Unauthorized status.
    

#### Request

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   POST /api/auth/login  {    "email": String,    "password": String,  }   `

#### Successful Response

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "accessToken": String,    "expiresIn": Int,  }   `

### Accessing Protected Routes

1.  Authorization Header
    

*   Given a valid token in the Authorization header, when the user accesses a protected route, then the system should allow access and return the requested data.
    

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "Authorization": "Bearer eyJhbGciOiJIUzI1N...."  }   `

*   Given a request without an Authorization header or with an invalid token, when the user accesses a protected route, then the system should return 401 Unauthorized status.
    

1.  Role-based access control ?? (TBD: not sure if this is needed for boiler-plates)
    

### Error Handling

1.  Invalid Credentials
    

*   When the user logs in, then the system should return a 401 Unauthorized status with an appropriate error message.
    

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "message": "Invalid credentials",    "statusCode": 401  }   `

### Testing

1.  Unit Tests
    

*   The systems should have unit tests covering authentication logic, including successful and failed login attempts, token generation and validation
