// generate-token.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

// Use the secret key from the environment variable
const secretKey = 'EJIRO';

// Define the payload of the JWT token
const payload = {
  sub: 'admin',
  role: 'admin',
};

// Define options (optional)
const options = {
  expiresIn: '7d', // Token expires in 1 hour
};

// Sign the token
const token = jwt.sign(payload, secretKey, options);

console.log('Generated JWT Token:', token);
