import { CfnOutput, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { kebabCase } from 'change-case';
import type { Construct } from 'constructs';

import { AuroraDatabaseConstruct } from './aurora-database-construct.js';
import { PROJECT_NAME } from './constants.js';
import { MigrationConstruct } from './migration-construct.js';

export class KazeNoMangaDatabaseStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, 'LogGroup', {
      logGroupName: `/${kebabCase(PROJECT_NAME)}/db`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_MONTH,
    });

    // Create Aurora database with migration
    const database = new AuroraDatabaseConstruct(this, 'Database');

    // Create migration Lambda
    new MigrationConstruct(this, 'Migration', {
      cluster: database.cluster,
      databaseCredentials: database.databaseCredentials,
      logGroup,
    });

    // Export database connection details for backend
    new CfnOutput(this, 'DatabaseClusterArn', {
      value: database.cluster.clusterArn,
      description: 'Aurora Cluster ARN',
      exportName: `${this.stackName}-DatabaseClusterArn`,
    });

    new CfnOutput(this, 'DatabaseSecretArn', {
      value: database.databaseCredentials.secretArn,
      description: 'Database Credentials Secret ARN',
      exportName: `${this.stackName}-DatabaseSecretArn`,
    });

    new CfnOutput(this, 'DatabaseName', {
      value: 'kazenomanga',
      description: 'Database Name',
      exportName: `${this.stackName}-DatabaseName`,
    });

    new CfnOutput(this, 'VpcId', {
      value: database.vpc.vpcId,
      description: 'VPC ID for Lambda deployment',
      exportName: `${this.stackName}-VpcId`,
    });
  }
}
