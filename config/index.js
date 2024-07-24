// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path');

const profile = process.env.PROFILE || 'local';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const configProfile = require(join(__dirname, profile));

module.exports = configProfile;
