import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { memoryStorage as _memoryStorage } from 'multer'
import { ApiTags, ApiBody, ApiConsumes, ApiOperation, ApiBearerAuth, } from '@nestjs/swagger'
import { StorageService } from './storage.service'
import { StreamableFile } from '@nestjs/common'
import express from 'express';
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtRedisGuard } from '../guard/jwt-redis.guard'


@ApiTags('STORAGES')
@Controller('storage')
export class StorageController {
  constructor(private readonly service: StorageService) { }

  @Post('upload')
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Upload a file' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: express.Request) {
    const protoHeader = req.headers['x-forwarded-proto'];

    const proto =
      Array.isArray(protoHeader)
        ? protoHeader[0]
        : protoHeader;
    const baseUrl =
      `${proto || req.protocol || 'http'}://${req.get('host')}`;

    return this.service.upload(file, baseUrl)
  }



  @Get('file/:filename')
  @ApiOperation({ summary: 'Get a file by filename' })
  async getFile(@Param('filename') filename: string) {
    const stream = await this.service.getFileStream(filename)
    return new StreamableFile(stream)
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete a file by filename' })
  async delete(@Param('filename') filename: string) {
    return this.service.delete(filename)
  }

}