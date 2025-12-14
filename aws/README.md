# Aurora Database Infrastructure

Aurora Serverless v2 database infrastructure for Kaze no Manga platform.

## Features

- **Aurora Serverless v2** with PostgreSQL 16.6
- **Auto-pause** to 0 ACU for cost savings (~$1-5/month)
- **Data API** enabled for AppSync integration
- **Automatic migrations** via Lambda + drizzle-kit
- **Environment-specific** configurations

## Quick Start

```bash
# Install dependencies
npm install

# Deploy development environment
npm run deploy

# Deploy production environment  
npm run deploy:prod

# View differences before deploy
npm run diff

# Destroy stack
npm run destroy
```

## Configuration

The stack supports two environments:

### Development (default)
- Auto-pause enabled (0 ACU minimum)
- Deletion protection disabled
- Backup disabled
- Cost: ~$1-5/month

### Production
- Auto-pause enabled (0 ACU minimum) 
- Deletion protection enabled
- Enhanced monitoring disabled for cost
- Cost: ~$1-5/month + storage

## Outputs

The stack exports these values for the backend:

- `DatabaseClusterArn` - Aurora cluster ARN
- `DatabaseSecretArn` - Credentials secret ARN  
- `DatabaseName` - Database name (kazenomanga)

## Cost Optimization

- **0 ACU minimum** - Database pauses when idle
- **1 ACU maximum** - Limits scaling costs
- **5 minute timeout** - Quick pause for cost savings
- **No enhanced monitoring** - Reduces overhead
- **Default VPC** - No NAT Gateway costs
