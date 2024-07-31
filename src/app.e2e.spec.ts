import HealthController from './health.controller';
import ProbeController from './probe.controller';

describe('Health Check Test', () => {
  let healthController: HealthController;
  let probeController: ProbeController;

  beforeEach(() => {
    healthController = new HealthController();
    probeController = new ProbeController();
  });

  describe('Get Health endpoint', () => {
    it('should return healthy endpoint', async () => {
      const result = { message: 'This is a healthy endpoint ...', status_code: 200 };

      expect(await healthController.health()).toStrictEqual(result);
    });
  });

  describe('Get the backend api responding', () => {
    it('should return nest js api', async () => {
      const result = { message: 'I am the NestJs api responding', status_code: 200 };

      expect(await probeController.test()).toStrictEqual(result);
    });
  });
});
