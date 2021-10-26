import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'eatsbucketSQKOU';
console.log(process.env.AWS_ACCESS_KEY_ID);
@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: 'B6bTDjKyUt92iWXKw6TQYmWyfwKCxFLy613MeUvr',
      },
    });
    try {
      const objectName = `${Date.now() + file.originalname}`;
      const upload = await new AWS.S3()
        .createBucket({
          Bucket: '',
        })
        .promise();
      console.log({ upload });
      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (e) {
      return null;
    }
  }
}
