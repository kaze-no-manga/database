import { defineConfig } from 'drizzle-kit';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE: string;
      SECRET_ARN: string;
      RESOURCE_ARN: string;
      DRIZZLE_LOCAL?: string; // Set to 'true' to disable AWS Data API
    }
  }
}

const isLocal = process.env.DRIZZLE_LOCAL === 'true';

export default defineConfig({
  out: './db/migrations',
  schema: './lib/models/index.ts',
  dialect: 'postgresql',
  ...(isLocal
    ? {}
    : {
        driver: 'aws-data-api',
        dbCredentials: {
          database: process.env.DATABASE,
          secretArn: process.env.SECRET_ARN,
          resourceArn: process.env.RESOURCE_ARN,
        },
      }),
});
