import { drizzle } from 'drizzle-orm/aws-data-api/pg';

import * as schema from '../models';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE: string;
      SECRET_ARN: string;
      RESOURCE_ARN: string;
    }
  }
}

export const db = drizzle({
  connection: {
    database: process.env.DATABASE,
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.RESOURCE_ARN,
  },
  schema,
});
