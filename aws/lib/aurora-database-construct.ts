import { RemovalPolicy } from 'aws-cdk-lib';
import { type IVpc, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  AuroraPostgresEngineVersion,
  ClusterInstance,
  Credentials,
  DatabaseCluster,
  DatabaseClusterEngine,
} from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

import { PROJECT_NAME } from './constants.js';

export class AuroraDatabaseConstruct extends Construct {
  public readonly cluster: DatabaseCluster;
  public readonly databaseCredentials: Secret;
  public readonly vpc: IVpc;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Use default VPC (practical for Lambda internet access)
    this.vpc = Vpc.fromLookup(this, 'DefaultVpc', {
      isDefault: true,
    });

    // Create database credentials secret
    this.databaseCredentials = new Secret(this, 'DatabaseCredentials', {
      description: `Credentials for ${PROJECT_NAME} Aurora database`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
    });

    // Create Aurora Serverless v2 cluster
    this.cluster = new DatabaseCluster(this, 'AuroraCluster', {
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_17_6,
      }),
      credentials: Credentials.fromSecret(this.databaseCredentials),
      writer: ClusterInstance.serverlessV2('writer', {
        scaleWithWriter: true,
      }),
      serverlessV2MinCapacity: 0,
      serverlessV2MaxCapacity: 1,
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC, // Default VPC only has public subnets
      },
      defaultDatabaseName: PROJECT_NAME.toLowerCase(),
      enableDataApi: true,

      // Environment-specific settings
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
