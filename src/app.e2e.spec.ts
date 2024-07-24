import HealthController from './health.controller';

describe('Health Check Test', () => {
  let healthController: HealthController;

  beforeEach(() => {
    healthController = new HealthController();
  });

  describe('Get Health endpoint', () => {
    it('should return healthy endpoint', async () => {
      const result = { message: 'This is a healthy endpoint', status_code: 200 };

      expect(await healthController.health()).toStrictEqual(result);
    });
  });
});
