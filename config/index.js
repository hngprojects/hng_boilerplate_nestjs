const { join } = require('path');

const profile = process.env.PROFILE || 'local';
const configProfile = require(join(__dirname, profile));

module.exports = configProfile;
