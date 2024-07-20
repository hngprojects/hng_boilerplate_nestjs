import { SeedingService } from './database/seeding.service';
import { Express } from 'express';

export function setupRoutes(server: Express, seedingService: SeedingService) {
  server.get('/users', async (req, res) => {
    const users = await seedingService.getUsers();
    res.json(users);
  });

  server.get('/profiles', async (req, res) => {
    const profiles = await seedingService.getProfiles();
    res.json(profiles);
  });

  server.get('/products', async (req, res) => {
    const products = await seedingService.getProducts();
    res.json(products);
  });

  server.get('/organisations', async (req, res) => {
    const organisations = await seedingService.getOrganisations();
    res.json(organisations);
  });
}
