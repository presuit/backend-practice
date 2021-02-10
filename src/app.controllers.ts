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
import { AppServices } from './app.services';

@Controller('/uploads')
export class AppControllers {
  constructor(private readonly appServices: AppServices) {}

  @Post('')
  @UseInterceptors(FilesInterceptor('uploads'))
  async uploadImage(@UploadedFiles() uploads) {
    return this.appServices.uploadImgs(uploads);
  }

  @Delete('')
  async deleteImgFromS3(
    @Body() body: { bucket: string; key: string },
  ): Promise<{ deleted: boolean; error?: string }> {
    return this.appServices.deleteImg(body);
  }
}
