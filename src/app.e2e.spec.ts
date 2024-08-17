import AppController from "./app.controller";

describe('App Check Test', () => {
  let appController: AppController;

  beforeEach(() => {
    appController = new AppController();
  });

  describe('Get Health endpoint', () => {
    it('should return healthy endpoint', async () => {
      const result = { message: 'This is a healthy endpoint', status_code: 200 };

      expect(await appController.health()).toMatchObject(result);
    });
  });

  describe('Get the backend api responding', () => {
    it('should return nest js api', async () => {
      const result = { message: 'I am the NestJs api responding', status_code: 200 };

      expect(await appController.probe()).toStrictEqual(result);
    });
  });
});
