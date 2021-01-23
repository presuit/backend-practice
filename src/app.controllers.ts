import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'ckeditor-image-uploader';

@Controller('/uploads')
export class AppControllers {
  @Post('')
  @UseInterceptors(FilesInterceptor('uploads'))
  async uploadImage(@UploadedFiles() uploads) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESSKEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      },
    });
    try {
      console.log(uploads);
      const uploadContainer = [];

      for (const eachUpload of uploads) {
        const objectName = Date.now() + eachUpload.originalname;
        await new AWS.S3()
          .putObject({
            Body: eachUpload.buffer,
            Bucket: BUCKET_NAME,
            Key: objectName,
            ACL: 'public-read',
          })
          .promise();
        const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
        uploadContainer.push({ uploaded: true, url: fileUrl });
      }

      console.log(uploadContainer);
      return uploadContainer;
    } catch (error) {
      console.log(error);
      return {
        uploaded: false,
        url: null,
      };
    }
  }
}
