import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it } from 'vitest';

import { KazeNoMangaDatabaseStack } from '../lib/database-stack.js';

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

describe('KazeNoMangaDatabaseStack', () => {
  it('creates complete database infrastructure', () => {
    const app = new App();
    Object.entries(mockContext).forEach(([key, value]) => {
      app.node.setContext(key, value);
    });

    const stack = new KazeNoMangaDatabaseStack(app, 'TestStack', {
      env: { account: '541243713624', region: 'eu-central-1' },
    });

    const template = Template.fromStack(stack);

    // Aurora cluster
    template.hasResourceProperties('AWS::RDS::DBCluster', {
      Engine: 'aurora-postgresql',
      EnableHttpEndpoint: true,
    });

    // Migration Lambda
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'kaze-migration',
    });

    // Log group
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: '/kaze-no-manga/db',
    });
  });

  it('exports correct outputs', () => {
    const app = new App();
    Object.entries(mockContext).forEach(([key, value]) => {
      app.node.setContext(key, value);
    });

    const stack = new KazeNoMangaDatabaseStack(app, 'TestStack', {
      env: { account: '541243713624', region: 'eu-central-1' },
    });

    const template = Template.fromStack(stack);

    template.hasOutput('DatabaseClusterArn', {});
    template.hasOutput('DatabaseSecretArn', {});
    template.hasOutput('DatabaseName', {});
    template.hasOutput('VpcId', {});
  });
});
