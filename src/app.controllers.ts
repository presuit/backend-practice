import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'ckeditor-image-uploader';

@Controller('/uploads')
export class AppControllers {
  @Post('')
  @UseInterceptors(FileInterceptor('upload'))
  async uploadImage(@UploadedFile() upload) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESSKEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      },
    });
    try {
      const objectName = Date.now() + upload.originalname;
      await new AWS.S3()
        .putObject({
          Body: upload.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;

      return {
        uploaded: true,
        url: fileUrl,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
