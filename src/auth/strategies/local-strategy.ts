import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../../entities/User';
import { comparePassword } from '../utils/password';
import { logger } from '../../config/logger';

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          logger.info('User not found for email:', email);
          throw new Error('User not found');
        }
        const isMatch = await comparePassword(
          password,
          user.password
        );
        if (!isMatch) {
          logger.info('Incorrect password for user:', email);
          throw new Error('Incorrect password');
        }
        done(null, user);
      } catch (error) {
        logger.error('Error in local strategy:', error);
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, (user as any).id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
