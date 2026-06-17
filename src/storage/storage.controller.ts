import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { memoryStorage as _memoryStorage } from 'multer'
import { ApiTags, ApiBody, ApiConsumes, ApiOperation, } from '@nestjs/swagger'
import { StorageService } from './storage.service'
import { StreamableFile } from '@nestjs/common'
// import { PermissionsGuard, } from '../permissions/permissions.guard'
// import { JwtRedisGuard } from '../auth/guard/jwt-redis.guard'
// import { CrudRateLimitGuard } from '../auth/guard/crud-rate-limit.guard'
import express from 'express';
import { FileInterceptor } from '@nestjs/platform-express'
// import { ApiDelete, ApiFileUpload, ApiRead } from '../types/response'


@ApiTags('STORAGES')
@Controller('storage')
export class StorageController {
  constructor(private readonly service: StorageService) { }

  @Post('upload')
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
  // @ApiRead(Storage, {}, { permission: `${PermissionGroup}:read`, guards: [JwtRedisGuard, PermissionsGuard, CrudRateLimitGuard] })
  async getFile(@Param('filename') filename: string) {
    const stream = await this.service.getFileStream(filename)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return new StreamableFile(stream)
  }

  @Delete(':filename')
  // @ApiDelete(Storage, {}, { permission: `${PermissionGroup}:delete`, guards: [JwtRedisGuard, PermissionsGuard, CrudRateLimitGuard] })
  async delete(@Param('filename') filename: string) {
    return this.service.delete(filename)
  }

}