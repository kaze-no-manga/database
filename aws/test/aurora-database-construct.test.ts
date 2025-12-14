import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it } from 'vitest';

import { AuroraDatabaseConstruct } from '../lib/aurora-database-construct.js';

// Mock context for VPC lookup
const mockContext = {
  'vpc-provider:account=541243713624:filter.isDefault=true:region=eu-central-1:returnAsymmetricSubnets=true':
    {
      vpcId: 'vpc-96993eff',
      vpcCidrBlock: '172.31.0.0/16',
      ownerAccountId: '541243713624',
      availabilityZones: [],
      subnetGroups: [
        {
          name: 'Public',
          type: 'Public',
          subnets: [
            {
              subnetId: 'subnet-720ea51b',
              cidr: '172.31.0.0/20',
              availabilityZone: 'eu-central-1a',
              routeTableId: 'rtb-9002a1f9',
            },
            {
              subnetId: 'subnet-5ac10b21',
              cidr: '172.31.16.0/20',
              availabilityZone: 'eu-central-1b',
              routeTableId: 'rtb-9002a1f9',
            },
            {
              subnetId: 'subnet-aa5761e0',
              cidr: '172.31.32.0/20',
              availabilityZone: 'eu-central-1c',
              routeTableId: 'rtb-9002a1f9',
            },
          ],
        },
      ],
    },
};

describe('AuroraDatabaseConstruct', () => {
  it('creates Aurora cluster with correct configuration', () => {
    const app = new App();
    Object.entries(mockContext).forEach(([key, value]) => {
      app.node.setContext(key, value);
    });

    const stack = new Stack(app, 'TestStack', {
      env: { account: '541243713624', region: 'eu-central-1' },
    });

    new AuroraDatabaseConstruct(stack, 'TestDatabase');

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::RDS::DBCluster', {
      Engine: 'aurora-postgresql',
      EngineVersion: '17.6',
      EnableHttpEndpoint: true,
      ServerlessV2ScalingConfiguration: {
        MinCapacity: 0,
        MaxCapacity: 1,
      },
    });
  });

  it('creates database credentials secret', () => {
    const app = new App();
    Object.entries(mockContext).forEach(([key, value]) => {
      app.node.setContext(key, value);
    });

    const stack = new Stack(app, 'TestStack', {
      env: { account: '541243713624', region: 'eu-central-1' },
    });

    new AuroraDatabaseConstruct(stack, 'TestDatabase');

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::SecretsManager::Secret', {
      Description: 'Credentials for KazeNoManga Aurora database',
    });
  });

  it('uses default VPC with public subnets', () => {
    const app = new App();
    Object.entries(mockContext).forEach(([key, value]) => {
      app.node.setContext(key, value);
    });

    const stack = new Stack(app, 'TestStack', {
      env: { account: '541243713624', region: 'eu-central-1' },
    });

    new AuroraDatabaseConstruct(stack, 'TestDatabase');

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::RDS::DBSubnetGroup', {
      SubnetIds: ['subnet-720ea51b', 'subnet-5ac10b21', 'subnet-aa5761e0'],
    });
  });
});
