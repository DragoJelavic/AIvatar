import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './typeDefs/typeDefs.js';
import { userResolver } from './resolvers/userResolver';
import { avatarResolver } from './resolvers/avatarResolver';
import { ResolverContext } from './types/types';
import { connectDB } from './db';
import passport from 'passport';
import session from 'express-session';
import { IUser } from './entities/User.js';

const app = express();
const port = process.env.PORT || 4000;

const bootstrapServer = async () => {
  await connectDB(); // Connect to MongoDB

  const server = new ApolloServer<ResolverContext>({
    typeDefs,
    resolvers: [userResolver, avatarResolver],
  });
  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 * 60 },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<ResolverContext> => ({
        req,
        res,
        user: req.user as IUser,
      }),
    })
  );

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, () => {
    console.log(`🚀 Express is ready at http://localhost:${port}`);
    console.log(
      `🚀 GraphQL ready at http://localhost:${port}/graphql`
    );
  });
};

bootstrapServer();
