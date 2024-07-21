import HealthController from './health.controller';

describe('Health Check Test', () => {
  let healthController: HealthController;

  beforeEach(() => {
    healthController = new HealthController();
  });

  describe('Get Health endpoint', () => {
    it('should return Server is healthy', async () => {
      const result = 'Server is healthy';

      expect(await healthController.health()).toBe(result);
    });
  });
});
