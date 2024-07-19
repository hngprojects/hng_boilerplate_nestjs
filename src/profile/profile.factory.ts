import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { Profile } from '../entities/profile.entity';

export const ProfileFactory = setSeederFactory(Profile, (faker: Faker) => {
  const profile = new Profile();
  profile.first_name = faker.person.firstName();
  profile.last_name = faker.person.lastName();
  profile.phone = faker.phone.number();
  profile.avatar_image = faker.image.avatar();

  return profile;
});
