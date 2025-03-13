import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Request, Response, Express } from 'express';
import { version } from '../../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AIvatar API',
      version,
      description: 'AIvatar API',
    },
    servers: [
      {
        url: 'http://localhost:4000',
      },
    ],
  },
  apis: ['src/routes/*.ts', 'src/models/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
