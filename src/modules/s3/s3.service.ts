import { S3 } from 'aws-sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@shared/helpers/custom-http-filter';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class S3Service {
  private s3: S3;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  /**
   * Uploads a file to S3
   * @param file - The file to upload
   * @param folder - The folder in S3 where the file should be stored (e.g., 'resumes', 'images')
   * @returns The file URL
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file) {
      throw new CustomHttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileKey = `${folder}/${Date.now()}_${file.originalname}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const { Location } = await this.s3.upload(uploadParams).promise();
      return Location;
    } catch (error) {
      throw new CustomHttpException('Failed to upload file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
