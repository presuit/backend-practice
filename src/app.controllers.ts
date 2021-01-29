import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';
import { Request } from 'express';

const BUCKET_NAME = 'ckeditor-image-uploader';

@Controller('/uploads')
export class AppControllers {
  constructor() {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESSKEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      },
    });
  }
  @Post('')
  @UseInterceptors(FilesInterceptor('uploads'))
  async uploadImage(@UploadedFiles() uploads) {
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

  @Delete('')
  async deleteImgFromS3(
    @Body() body: { bucket: string; key: string },
  ): Promise<{ deleted: boolean; error?: string }> {
    try {
      await new AWS.S3()
        .deleteObject({ Bucket: body.bucket || BUCKET_NAME, Key: body.key })
        .promise();
      return {
        deleted: true,
      };
    } catch (error) {
      console.log(error);
      return {
        deleted: false,
        error,
      };
    }
  }
}
