import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

export class UserRepository extends Repository<User> {
  // Method to find a user by email
  async findByEmail(email: string): Promise<User | undefined> {
    return await this.findOne({ where: { email } });
  }

  // Method to find a user by id
  async findById(id: string): Promise<User | undefined> {
    return await this.findOne({ where: { id } });
  }

  // Method to update user password
  async updatePassword(id: string, newPassword: string): Promise<User | undefined> {
    const user = await this.findOne({ where: { id } });
    if (!user) return undefined;
    user.password = newPassword;
    return this.save(user);
  }
}
