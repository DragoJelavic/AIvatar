import { hashPassword } from '../auth/utils/password';
import { User } from '../entities/User';
import { pbkdf2Sync } from 'crypto';

export const userResolver = {
  Query: {
    getUser: async (_: unknown, { id }: { id: string }) => {
      return await User.findById(id).populate('avatars');
    },
  },
  Mutation: {
    createUser: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      const hashedPassword = hashPassword(password);
      const user = new User({ email, password: hashedPassword });
      return await user.save();
    },
    login: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const [salt, storedHash] = user.password.split(':');
      const hash = pbkdf2Sync(
        password,
        salt,
        1000,
        64,
        'sha512'
      ).toString('hex');

      if (hash !== storedHash) {
        throw new Error('Invalid password');
      }

      // Here you would typically generate and return a JWT token
      return user;
    },
  },
};
