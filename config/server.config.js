'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const config_1 = require('@nestjs/config');
exports.default = (0, config_1.registerAs)('server', () => ({
  port: parseInt(process.env.PORT, 10) || 3008,
}));
//# sourceMappingURL=server.config.js.map
