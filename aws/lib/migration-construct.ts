import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CustomResource, Duration } from 'aws-cdk-lib';
import { LoggingFormat } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { LogGroup } from 'aws-cdk-lib/aws-logs';
import type { DatabaseCluster } from 'aws-cdk-lib/aws-rds';
import type { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { kebabCase } from 'change-case';
import { Construct } from 'constructs';

import { PROJECT_NAME, PROJECT_PREFIX } from './constants.js';

interface MigrationConstructProps {
  cluster: DatabaseCluster;
  databaseCredentials: Secret;
  logGroup: LogGroup;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MigrationConstruct extends Construct {
  constructor(scope: Construct, id: string, props: MigrationConstructProps) {
    super(scope, id);

    const { cluster, databaseCredentials, logGroup } = props;

    const migrationParam = new StringParameter(this, 'MigrationParameter', {
      parameterName: `/${kebabCase(PROJECT_NAME)}/db/migrations`,
      stringValue: '',
    });

    const migrationLambda = new NodejsFunction(this, 'MigrationLamda', {
      functionName: `${PROJECT_PREFIX}-migration`,
      entry: join(__dirname, '../src/migration.ts'),
      timeout: Duration.minutes(5),
      loggingFormat: LoggingFormat.JSON,
      logGroup,
      environment: {
        DATABASE_ARN: cluster.clusterArn,
        DATABASE_NAME: PROJECT_NAME.toLowerCase(),
        PARAM_NAME: migrationParam.parameterName,
        SECRET_ARN: databaseCredentials.secretArn,
        // PowerTools configuration
        LOG_LEVEL: 'INFO',
        POWERTOOLS_SERVICE_NAME: 'kaze-migration',
        POWERTOOLS_METRICS_NAMESPACE: `${PROJECT_NAME}/Database`,
      },
      bundling: {
        commandHooks: {
          beforeBundling: (inputDir: string, outputDir: string) => [
            `cp -r ${inputDir}/db ${outputDir}/`,
          ],
          afterBundling: () => [],
          beforeInstall: () => [],
        },
      },
    });

    // Grant database access
    databaseCredentials.grantRead(migrationLambda);
    cluster.grantDataApiAccess(migrationLambda);
    migrationParam.grantRead(migrationLambda);
    migrationParam.grantWrite(migrationLambda);

    const migrationProvider = new Provider(this, 'MigrationProvider', {
      onEventHandler: migrationLambda,
    });

    const migrationFiles = readdirSync(join(__dirname, '../../db/migrations'));

    new CustomResource(this, 'DatabaseMigration', {
      serviceToken: migrationProvider.serviceToken,
      properties: {
        // Trigger re-deployment when migrations change
        migrations: migrationFiles.length.toString(),
        migrationHash: migrationFiles.join(','),
      },
    });
  }
}
