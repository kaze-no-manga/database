import { readdirSync, readFileSync } from 'node:fs';

import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import { getParameter, setParameter } from '@aws-lambda-powertools/parameters/ssm';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { ExecuteStatementCommand, RDSDataClient } from '@aws-sdk/client-rds-data';
import type { CloudFormationCustomResourceEvent, Context } from 'aws-lambda';

const logger = new Logger();
const tracer = new Tracer();
const metrics = new Metrics();

const client = tracer.captureAWSv3Client(new RDSDataClient({}));

export const handler = async (event: CloudFormationCustomResourceEvent, context: Context) => {
  const segment = tracer.getSegment();
  segment?.addAnnotation('operation', 'database-migration');

  logger.info('Migration event received', { event });

  const {
    DATABASE_ARN: resourceArn,
    DATABASE_NAME: database,
    PARAM_NAME: parameterName,
    SECRET_ARN: secretArn,
  } = process.env;

  if (!resourceArn || !database || !parameterName || !secretArn) {
    throw new Error('Missing required environment variables');
  }

  try {
    // Get last applied migration from SSM
    const lastMigration = (await getParameter(parameterName)) ?? '';

    // Get migration files
    const migrationFiles = readdirSync('./db/migrations')
      .filter((f) => f.endsWith('.sql'))
      .sort();

    logger.info('Migration status', {
      totalMigrations: migrationFiles.length,
      lastApplied: lastMigration,
    });

    // Find migrations to apply
    const lastIndex = lastMigration ? migrationFiles.indexOf(lastMigration) : -1;
    const newMigrations = migrationFiles.slice(lastIndex + 1);

    if (newMigrations.length === 0) {
      logger.info('No new migrations to apply');
      metrics.addMetric('MigrationsApplied', MetricUnit.Count, 0);

      return {
        Status: 'SUCCESS',
        PhysicalResourceId: context.logStreamName,
        Data: { Message: 'No migrations needed' },
      };
    }

    logger.info('Applying migrations', { newMigrations });

    // Apply new migrations
    for (const file of newMigrations) {
      const migrationSegment = segment?.addNewSubsegment(`migration-${file}`);

      try {
        logger.info('Applying migration', { file });

        const sql = readFileSync(`./db/migrations/${file}`, 'utf8');

        // Split by statement-breakpoint and execute each statement
        const statements = sql
          .split('--> statement-breakpoint')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const [index, statement] of statements.entries()) {
          await client.send(
            new ExecuteStatementCommand({
              resourceArn,
              secretArn,
              database,
              sql: statement,
            }),
          );

          logger.debug('Statement executed', { file, statementIndex: index });
        }

        // Update SSM parameter with last applied migration
        await setParameter(parameterName, {
          value: file,
          overwrite: true,
        });

        logger.info('Migration applied successfully', { file });
        metrics.addMetric('MigrationApplied', MetricUnit.Count, 1);
      } catch (error) {
        logger.error('Migration failed', { file, error });
        metrics.addMetric('MigrationFailed', MetricUnit.Count, 1);
        throw error;
      } finally {
        migrationSegment?.close();
      }
    }

    logger.info('All migrations completed successfully', {
      appliedCount: newMigrations.length,
    });

    metrics.addMetric('MigrationsApplied', MetricUnit.Count, newMigrations.length);

    return {
      Status: 'SUCCESS',
      PhysicalResourceId: context.logStreamName,
      Data: {
        Message: `Applied ${newMigrations.length} migrations`,
        lastMigration: newMigrations[newMigrations.length - 1],
      },
    };
  } catch (error) {
    logger.error('Migration process failed', { error });
    metrics.addMetric('MigrationProcessFailed', MetricUnit.Count, 1);

    return {
      Status: 'FAILED',
      PhysicalResourceId: context.logStreamName,
      Reason: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    metrics.publishStoredMetrics();
  }
};
