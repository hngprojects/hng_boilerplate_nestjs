import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  accessKey: process.env.AWS_ACCESS_KEY || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'us-east-2',
  bucketName: process.env.AWS_S3_BUCKET_NAME || '',
}));
