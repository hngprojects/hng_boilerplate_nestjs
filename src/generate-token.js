const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET || 'EJIRO';

const payload = {
  sub: 'admin',
  role: 'admin',
  org_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
};

const options = {
  expiresIn: '7d',
};

const token = jwt.sign(payload, secretKey, options);

console.log('Generated JWT Token:', token);
