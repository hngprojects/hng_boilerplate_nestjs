import HealthController from "./health.controller";

describe('Health Check Test', () => {
    let healthController: HealthController;

    beforeEach(() => {
        healthController = new HealthController();
    });

    describe('Get Health endpoint', () => {
        it('should return healthy endpoint', async () => {
            const result = 'healthy endpoint';

            expect(await healthController.health()).toBe(result);
        });
    });

});