import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Storage } from './storage.schema'
import { MinioService } from '../minio/minio.service'
import { auditLogger } from '@/logger/winston-mongodb.logger'

@Injectable()
export class StorageService {
  private readonly bucket = process.env.MINIO_BUCKET

  constructor(
    private readonly minio: MinioService,
    @InjectModel(Storage.name) private model: Model<Storage>,
  ) { }

  async upload(file: Express.Multer.File, baseUrl: string) {
    const uploaded = await this.minio.upload(file)

    const doc = await this.model.create({
      filename: uploaded.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      isPublic: true,
      url: `${baseUrl}/storage/file/${uploaded.filename}`, // 🔥 IMPORTANT CHANGE
    })
    if (!doc) {
      auditLogger.error(`Failed to create storage document for file: ${file.originalname}`)
      throw new Error('Failed to create storage document')
    }
    return doc
  }

  async getFileStream(filename: string) {
    if (!filename) {
      auditLogger.error('Filename is required to get file stream')
      throw new Error('Filename is required')
    }
    const res = await this.minio.getObject(this.bucket, filename)
    if (!res) {
      auditLogger.error(`Failed to get file stream for filename: ${filename}`)
      throw new Error('Failed to get file stream')
    }
    return res
  }

  async delete(filename: string) {
    const state = await this.minio.delete(this.bucket, filename)
    const result = await this.model.deleteOne({ filename }).exec()
    if (!result || !state) {
      auditLogger.error(`File not found in database: ${filename}`)
      throw new Error('File not found in database')
    }
    return { status: 'success', message: 'File deleted successfully' }
  }


}